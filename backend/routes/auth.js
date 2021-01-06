const router = require("express").Router()
const User = require("../models/User")
const RefreshToken = require("../models/RefreshToken");
const bcryptHandler = require("../utils/bcryptHandler")
const { auth } = require("../middleware/auth")
const { generateAccessToken, generateRefreshToken } = require("../utils/tokenHandler");

// @route GET /user
// @description Get user data
// @access Private
router.get("/user", auth, async (req, res) => {
    try {
        const _id = req.user._id;
        const filter = { _id };

        const user = await User.findOne(filter);

        const userDTO = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            isAdmin: user.isAdmin,
            teamToken: user.teamToken
        };
        return res.status(200).json({ userDTO });
    } catch (error) {
        console.log("Get user: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route POST /sigin
// @description Sign in user
// @access Public
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Sign in failed, invalid email or password" })
        };

        const filter = { email };

        const user = await User.findOne(filter);

        if (!user) return res.status(404).json({ msg: "Sign in failed, invalid email or password" });

        if (!user.isConfirmed) return res.status(401).json({ msg: "You need to verify you account first" });

        const isPasswordsEqual = await bcryptHandler.comparePasswords(password, user.password)

        if (isPasswordsEqual) {
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
            };
        } else {
            return res.status(400).json({ msg: "Sign in failed, invalid email or password" });
        };
    } catch (error) {
        console.log("Sign in: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});



// @route POST /token
// @description Get new access token with refresh token
// @access Public
router.post("/token", async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) return res.status(400).json({ msg: "Invalid request, please try again" });

        const filter = { refreshToken };

        const doc = await RefreshToken.findOne(filter);

        if (!doc) return res.status(401).json({ msg: "You are not allowed to renew your access token" });

        const token = await generateAccessToken(user._id);
        return res.status(200).json({ msg: "You have successfully renewed your session", token });

    } catch (error) {
        console.log("New access token: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route DELETE /signout
// @description Sign out user
// @access Private
router.delete("/signout", async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) return res.status(400).json({ msg: "Failed to log you out, please try again" });

        const filter = { refreshToken };

        const doc = await RefreshToken.findOneAndDelete(filter);

        if (!doc) return res.status(400).json({ msg: "Failed to log you out, please try again" });
        return res.status(200).json({ msg: "You have now been logged out" });

    } catch (error) {
        console.log("Sign out: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

module.exports = router;