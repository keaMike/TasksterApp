const router = require("express").Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const { isUserAdmin } = require("../utils/adminAuth");

// @route GET /
// @description Get all team members
// @access Private
router.get("/:teamToken", auth, async (req, res) => {
    try {
        const teamToken = req.params.teamToken;

        if (!teamToken) return res.status(400).json({ msg: "Invalid request, try again" });

        const filter = { teamToken };
        const sort = { isAdmin: -1 };

        const members = await User.find(filter).sort(sort);

        if (!members) return res.status(400).json({ msg: "Invalid request, try again" });

        return res.status(200).json({ members: members });
    } catch (error) {
        console.log("Get team members: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route PATCH /
// @description Make team member admin or member
// @access Private & Admin only
router.patch("/:id", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const _id = req.params.id;
        const { isAdmin } = req.body;

        if (userId === _id) return res.status(401).json({ msg: "You are not allowed to change your own role" });

        const isVerified = await isUserAdmin(userId);

        if (isVerified) {
            const filter = { _id };
            const update = { $set: { isAdmin } };

            const user = User.findOneAndUpdate(filter, update)

            if (!user) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ msg: "Team member role was successfully changed" });
        } else {
            return res.status(401).json({ msg: "You are not allowed to use this feature" });
        };
    } catch (error) {
        console.log("Remove team member: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route PATCH /
// @description Remove team member
// @access Private & Admin only
router.patch("/remove/:id", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const _id = req.params.id;

        if (userId === _id) return res.status(401).json({ msg: "You are not allowed to remove yourself" });

        const isVerified = await isUserAdmin(userId);

        if (isVerified) {
            const filter = { _id };
            const update = { $set: { teamToken: "", isAdmin: false } };

            const user = await User.findOneAndUpdate(filter, update);

            if (!user) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ msg: "Team member was successfully removed" });
        } else {
            return res.status(401).json({ msg: "You are not allowed to use this feature" });
        };
    } catch (error) {
        console.log("Remove team member: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

module.exports = router;