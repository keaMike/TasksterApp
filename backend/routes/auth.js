const router = require("express").Router()
const User = require("../models/User")
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("../utils/bcrypt")
const auth = require("../middleware/auth")

// @route GET /user
// @description Get user data
// @access Private
router.get("/user", auth, (req, res) => {
    const _id = req.user._id;
    const filter = { _id };

    User.findOne(filter)
        .then((user) => {
            const userDTO = {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                isAdmin: user.isAdmin,
                teamToken: user.teamToken
            }
            return res.status(200).json({ userDTO });
        })
        .catch((error) => {
            console.log("Get user: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        })
})

// @route POST /sigin
// @description Sign in user
// @access Public
router.post("/signin", (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ msg: "Sign in failed, invalid email or password" })
    }

    const filter = { email };

    User.findOne(filter)
        .then((user) => {
            if (!user) return res.status(404).json({ msg: "Sign in failed, invalid email or password" });
            if (!user.isConfirmed) return res.status(401).json({ msg: "You need to verify you account first" });

            bcrypt.comparePassword(password, user.password)
                .then(async () => {
                    const userDTO = {
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        isAdmin: user.isAdmin,
                        teamToken: user.teamToken
                    };

                    const token = await generateAccessToken(user._id);
                    const refreshToken = await generateRefreshToken(user._id);

                    if (token && refreshToken) {
                        return res.status(200).json({
                            token,
                            refreshToken,
                            user: userDTO,
                            msg: `You are now logged in! Welcome back ${user.firstname} ${user.lastname}`
                        });
                    } else {
                        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
                    }
                })
                .catch(() => {
                    return res.status(400).json({ msg: "Sign in failed, invalid email or password" });
                });
        })
        .catch((error) => {
            console.log("Sign in: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        })
})

const generateAccessToken = (_id) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { _id },
            process.env.JWT_KEY,
            { expiresIn: "10m" },
            (error, token) => {
                if (error) reject();
                resolve(token);
            }
        );
    });
}

const generateRefreshToken = (_id) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { _id },
            process.env.JWT_REFRESH_KEY,
            async (error, token) => {
                if (error) reject();
                const refreshToken = await saveRefreshToken(token);
                refreshToken ? resolve(refreshToken) : reject();
            }
        );
    });
}

const saveRefreshToken = (token) => {
    return new Promise((resolve, reject) => {
        const refreshToken = new RefreshToken({
            refreshToken: token
        });
        refreshToken.save()
            .then((doc) => {
                if (!doc) reject();
                resolve(doc.refreshToken);
            })
            .catch(() => {
                reject();
            })
    });

};

// @route POST /token
// @description Get new access token with refresh token
// @access Public
router.post("/token", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(400).json({ msg: "Invalid request, please try again" });

    const filter = { refreshToken };

    RefreshToken.findOne(filter)
        .then((doc) => {
            if (!doc) return res.status(401).json({ msg: "You are not allowed to renew your access token" });
            jwt.verify(doc.refreshToken, process.env.JWT_REFRESH_KEY, async (error, user) => {
                if (error) return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
                const token = await generateAccessToken(user._id);
                return res.status(200).json({ msg: "You have successfully renewed your session", token });
            });
        })
        .catch((error) => {
            console.log("New acces token: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

// @route DELETE /signout
// @description Sign out user
// @access Private
router.delete("/signout", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(400).json({ msg: "Failed to log you out, please try again" });

    const filter = { refreshToken };

    RefreshToken.findOneAndDelete(filter)
        .then((doc) => {
            if (!doc) return res.status(400).json({ msg: "Failed to log you out, please try again" });
            return res.status(200).json({ msg: "You have now been logged out" });
        })
        .catch((error) => {
            console.log("Sign out: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

module.exports = router;