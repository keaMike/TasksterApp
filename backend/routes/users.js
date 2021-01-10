const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcryptHandler = require("../utils/bcryptHandler");
const User = require("../models/User");
const { auth } = require("../middleware/auth")
const { sendConfirmation, sendReset } = require("../utils/emailHandler");


// @route POST /
// @description Register user
// @access Public
router.post("/", async (req, res) => {
    try {
        const { firstname, lastname, email, password, teamToken } = req.body;

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ data: "Please fill out all fields" });
        };

        const filter = { email };

        const doc = await User.findOne(filter);

        if (doc) return res.status(400).json({ msg: "User already exists" })

        const user = new User({
            firstname,
            lastname,
            email,
            password,
            teamToken
        });

        const hash = await bcryptHandler.hashPassword(password);
        user.password = hash;
        const savedUser = await user.save();
        const emailStatus = await sendConfirmation(savedUser.email, savedUser._id);
        return res.status(200).json({ msg: emailStatus });

    } catch (error) {
        console.log("Register user: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route POST /forgot
// @description Will send email with intructions to reset password
// @access public
router.post("/forgot", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ msg: "Invalid email, try again" });

        const filter = { email };
        const user = await User.findOne(filter);
        if (!user) return res.status(400).json({ msg: "Invalid email, try again" });
        const emailStatus = await sendReset(user.email, user._id);

        return res.status(200).json({ msg: emailStatus });

    } catch (error) {
        console.log("Forgot password: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route POST /resend-confirm
// @description Will send email with confirmation link again
// @access public
router.post('/resend-confirm', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ msg: "Invalid email, try again" });

        const filter = { email };
        const user = await User.findOne(filter);
        if (!user) return res.status(400).json({ msg: "Invalid email, try again" });
        const emailStatus = await sendConfirmation(user.email, user._id);
        return res.status(200).json({ msg: emailStatus });

    } catch (error) {
        console.log("Resend confirmation: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route PATCH /
// @description Update user
// @access Private
router.patch("/", auth, async (req, res) => {
    try {
        const _id = req.user._id;
        const { firstname, lastname } = req.body;

        if (!_id || !firstname || !lastname) return res.status(400).json({ msg: "Invalid details, please try again" });

        const filter = { _id };
        const update = { $set: { firstname, lastname } };

        const user = User.findOneAndUpdate(filter, update);

        if (!user) res.status(400).json({ msg: "Invalid details, please try again" });
        return res.status(200).json({ msg: "Your profile has successfully been updated!" });
    } catch (error) {
        console.log("Update user: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route PATCH /reset
// @description Reset password
// @access public
router.patch("/reset", async (req, res) => {
    try {
        const { password, token } = req.body;

        if (!token) return res.status(401).json({ msg: "You are not authorized to reset this password" });

        if (!password) return res.status(400).json({ msg: "Invalid password, please try again" });

        const _id = jwt.verify(token, process.env.JWT_KEY)._id;

        const hash = await bcryptHandler.hashPassword(password);

        const filter = { _id };
        const update = { $set: { password: hash } };

        const user = await User.findOneAndUpdate(filter, update);

        if (!user) return res.status(400).json({ msg: "Invalid request, try again" });
        return res.status(200).json({ msg: "Your password was successfully reset" });

    } catch (error) {
        console.log("Reset password: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route PATCH /confirm
// @description Confirm account
// @access public
router.patch("/confirm", async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) return res.status(400).json({ msg: "We can't verify your account. Try again or contact us" });

        const _id = jwt.verify(token, process.env.JWT_KEY);
        const filter = { _id };
        const update = { $set: { isConfirmed: true } };

        const user = await User.findOneAndUpdate(filter, update);

        if (!user) return res.status(400).json({ msg: "Invalid request, try again" });
        return res.status(200).json({ msg: "Your account have now been verified!" });

    } catch (error) {
        console.log("Confirm user: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route DELETE /
// @description Delete user
// @access Private
router.delete("/", auth, async (req, res) => {
    try {
        const _id = req.user._id;

        if (!_id) return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });

        const filter = { _id };
        const user = await User.findOneAndDelete(filter);

        if (!user) return res.status(400).json({ msg: "Invalid request, try again" });
        return res.status(200).json({ msg: "Your profile has successfully been deleted" });

    } catch (error) {
        console.log("Delete user: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

module.exports = router;