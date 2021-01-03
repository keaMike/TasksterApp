const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("../utils/bcrypt");
const auth = require("../middleware/auth")
const { sendConfirmation, sendReset } = require("../utils/emailer");
const User = require("../models/User");

// @route POST /
// @description Register user
// @access Public
router.post("/", (req, res) => {
    const { firstname, lastname, email, password, teamToken } = req.body;

    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({ data: "Please fill out all fields" });
    };

    const filter = { email };

    User.findOne(filter)
        .then((found) => {
            if (found) return res.status(400).json({ msg: "User already exists" })

            let user = new User({
                firstname,
                lastname,
                email,
                password,
                teamToken
            });

            bcrypt.hashPassword(password)
                .then((hash) => {
                    user.password = hash;
                    user.save()
                        .then((doc) => {
                            sendConfirmation(doc.email, doc._id)
                                .then((msg) => {
                                    return res.status(200).json({ msg: msg });
                                })
                                .catch((error) => {
                                    return res.status(500).json({ msg: error });
                                })
                        })
                        .catch((error) => {
                            console.log("Register user: " + error);
                            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" })
                        });
                })
                .catch((error) => {
                    return res.status(500).json({ msg: error });
                });
        })
        .catch((error) => {
            console.log("Register user: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

// @route POST /forgot
// @description Will send email with intructions to reset password
// @access public
router.post("/forgot", (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Invalid email, try again" });

    const filter = { email };

    User.findOne(filter)
        .then((doc) => {
            if (!doc) return res.status(400).json({ msg: "Invalid email, try again" });
            sendReset(doc.email, doc._id)
                .then((msg) => {
                    return res.status(200).json({ msg: msg });
                })
                .catch((error) => {
                    return res.status(500).json({ msg: error });
                });
        })
        .catch((error) => {
            console.log("Forgot password: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" })
        });
});

// @route POST /resend-confirm
// @description Will send email with confirmation link again
// @access public
router.post('/resend-confirm', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Invalid email, try again" });

    const filter = { email };

    User.findOne(filter)
        .then((doc) => {
            if (!doc) return res.status(400).json({ msg: "Invalid email, try again" });
            sendConfirmation(doc.email, doc._id)
                .then((msg) => {
                    return res.status(200).json({ msg });
                })
                .catch((error) => {
                    return res.status(500).json({ msg: error });
                });
        })
        .catch((error) => {
            console.log("Resend confirmation: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        })
});

// @route PATCH /
// @description Update user
// @access Private
router.patch("/", auth, (req, res) => {
    const _id = req.user._id;
    const { firstname, lastname } = req.body;

    if (!_id || !firstname || !lastname) return res.status(400).json({ msg: "Invalid details, please try again" });

    const filter = { _id };
    const update = { $set: { firstname, lastname } };

    User.findOneAndUpdate(filter, update)
        .then((doc) => {
            if (!doc) res.status(400).json({ msg: "Invalid details, please try again" });
            return res.status(200).json({ msg: "Your account details have successfully been updated!" });
        })
        .catch((error) => {
            console.log("Update user: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

// @route PATCH /reset
// @description Reset password
// @access public
router.patch("/reset", (req, res) => {
    const { password, token } = req.body;

    if (!token) return res.status(401).json({ msg: "You are not authorized to reset this password" });

    if (!password) return res.status(400).json({ msg: "Invalid password, please try again" });

    const _id = jwt.verify(token, process.env.JWT_KEY);

    bcrypt.hashPassword(password)
        .then((hash) => {
            const filter = { _id };
            const update = { $set: { password: hash } };

            User.findOneAndUpdate(filter, update)
                .then((doc) => {
                    if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
                    return res.status(200).json({ msg: "Your password was successfully reset" });
                })
                .catch((error) => {
                    console.log("Reset password: " + error);
                    return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" })
                })
        })
        .catch((error) => {
            return res.status(500).json({ msg: error });
        });
});

// @route PATCH /confirm
// @description Confirm account
// @access public
router.patch("/confirm", (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(400).json({ msg: "We can't verify your account. Try again or contact us" });

    const _id = jwt.verify(token, process.env.JWT_KEY);
    const filter = { _id };
    const update = { $set: { isConfirmed: true } };

    User.findOneAndUpdate(filter, update)
        .then((doc) => {
            if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ msg: "Your account have now been verified!" });
        })
        .catch((error) => {
            console.log("Confirm user: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" })
        });
});

// @route DELETE /
// @description Delete user
// @access Private
router.delete("/", auth, (req, res) => {
    const _id = req.user._id;

    if (!_id) return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });

    const filter = { _id };

    User.findOneAndDelete(filter)
        .then(() => {
            return res.status(200).json({ msg: "Your account have successfully been deleted" });
        })
        .catch((error) => {
            console.log("Delete user: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        })
});

module.exports = router;