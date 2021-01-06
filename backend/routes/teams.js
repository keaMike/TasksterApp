const router = require("express").Router();
const Team = require("../models/Team");
const User = require("../models/User");
const { auth } = require("../middleware/auth");


// @route POST /
// @description Register team
// @access Private
router.post("/", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { teamname } = req.body;

        if (!teamname) return res.status(400).json({ msg: "Invalid request, please try again" });

        const filter = { teamname };

        const doc = Team.findOne(filter)

        if (doc) return res.status({ msg: "Team with given name already exists" });

        const team = new Team({
            teamname,
            createdBy: userId
        });

        const savedTeam = await team.save();

        if (!savedTeam) return res.status(400).json({ msg: "Team couldn't be registered, please try again" });

        const userFilter = { _id: userId };
        const userUpdate = { $set: { isAdmin: true, teamToken: doc.token } };
        const callback = (error) => {
            if (error) return res.status({ msg: "Failed to make you team admin, please contact us for help" });
        };

        User.updateOne(userFilter, userUpdate, callback);
        return res.status(200).json({ msg: "Your team was successfully registered!" });

    } catch (error) {
        console.log("Register team: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route PATCH /
// @description Join team
// @access Private
router.patch("/", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { teamToken } = req.body;

        if (!userId || !teamToken) return res.status(400).json({ msg: "Invalid request, please try again" });

        const teamFilter = { token: teamToken };

        const team = await Team.findOne(teamFilter);

        if (!team) return res.status(404).json({ msg: "Team doesn't exist, please try again" });

        const filter = { _id: userId };
        const update = { $set: { teamToken } };

        const user = await User.findOneAndUpdate(filter, update);

        if (!user) return res.status(400).json({ msg: "Failed to join team, please try again" });
        return res.status(200).json({ msg: "You have successfully joined a team!" });

    } catch (error) {
        console.log("Join team: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route DELETE /
// @description Delete team
// @access Private & Creator only
router.delete("/", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { teamToken } = req.body;

        if (!teamToken) return res.status(400).json({ msg: "Invalid request, please try again" });

        const filter = { createdBy: userId };

        const team = await Team.findOne(filter);

        if (!team) return res.status(401).json({ msg: "You are not allowed to use this feature" });

        const teamFilter = { token: teamToken };

        const removedTeam = await Team.findOneAndRemove(teamFilter)
        if (!removedTeam) return res.status(400).json({ msg: "Invalid request, please try again" });

        const userFilter = { teamToken };
        const userUpdate = { $set: { teamToken: "", isAdmin: false } };
        const options = { multi: true };
        const callback = (error) => {
            if (error) return res.status({ msg: "Failed to remove teammembers, please try again" });
        };

        User.updateMany(userFilter, userUpdate, options, callback)
        return res.status(200).json({ msg: "You successfully deleted the team" });
    } catch (error) {
        console.log("Delete team: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

module.exports = router;