const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const { verifyUserAsAdmin } = require("../utils/adminAuth");

// @route GET /
// @description Get all team members
// @access Private
router.get("/:teamToken", auth, (req, res) => {
    const teamToken = req.params.teamToken;

    if (!teamToken) return res.status(400).json({ msg: "Invalid request, try again" });

    const filter = { teamToken };
    const sort = { isAdmin: -1 };

    User.find(filter)
        .sort(sort)
        .then((doc) => {
            if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ members: doc });
        })
        .catch((error) => {
            console.log("Get team members: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

// @route PATCH /
// @description Make team member admin or member
// @access Private & Admin only
router.patch("/:id", auth, async (req, res) => {
    const userId = req.user._id;
    const _id = req.params.id;
    const { isAdmin } = req.body;

    if (userId === _id) return res.status(401).json({ msg: "You are not allowed to change your own role" });

    const verified = await verifyUserAsAdmin(userId);
    if (verified) {
        const filter = { _id };
        const update = { $set: { isAdmin } };

        User.findOneAndUpdate(filter, update)
            .then((doc) => {
                if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
                return res.status(200).json({ msg: "Team member role was successfully changed" });
            })
            .catch((error) => {
                console.log("Remove team member: " + error);
                return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
            });

    } else {
        return res.status(401).json({ msg: "You are not allowed to use this feature" });
    };
});

// @route PATCH /
// @description Remove team member
// @access Private & Admin only
router.patch("/remove/:id", auth, async (req, res) => {
    const userId = req.user._id;
    const _id = req.params.id;

    if (userId === _id) return res.status(401).json({ msg: "You are not allowed to remove yourself" });

    const verified = await verifyUserAsAdmin(userId);
    if (verified) {
        const filter = { _id };
        const update = { $set: { teamToken: "", isAdmin: false } };

        User.findOneAndUpdate(filter, update)
            .then((doc) => {
                if (!doc) return res.status(404).json({ msg: "Invalid request, try again" });
                return res.status(200).json({ msg: "Team member was successfully removed" });
            })
            .catch((error) => {
                console.log("Remove team member: " + error);
                return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
            })

    } else {
        return res.status(401).json({ msg: "You are not allowed to use this feature" });
    };

});

module.exports = router;