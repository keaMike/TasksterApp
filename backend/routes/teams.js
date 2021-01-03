const auth = require("../middleware/auth");
const Team = require("../models/Team");
const User = require("../models/User");

const router = require("express").Router();

// @route POST /
// @description Register team
// @access Private
router.post("/", auth, (req, res) => {
    const userId = req.user._id;
    const { teamname } = req.body;

    if (!teamname) return res.status(400).json({ msg: "Invalid request, please try again" });

    const filter = { teamname };

    Team.findOne(filter)
        .then((found) => {
            if (found) return res.status({ msg: "Team with given name already exists" });

            const team = new Team({
                teamname,
                createdBy: userId
            });

            team.save()
                .then((doc) => {
                    if (!doc) return res.status(400).json({ msg: "Team couldn't be registered, please try again" });

                    const userFilter = { _id: userId };
                    const userUpdate = { $set: { isAdmin: true, teamToken: doc.token } };
                    const callback = (error) => {
                        if (error) return res.status({ msg: "Failed to make you team admin, please contact us for help" });
                    };

                    User.updateOne(userFilter, userUpdate, callback);

                    return res.status(200).json({ msg: "Your team was successfully registered!" });
                })
                .catch((error) => {
                    console.log("Register team: " + error);
                    return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
                });
        });
});

// @route PATCH /
// @description Join team
// @access Private
router.patch("/", auth, (req, res) => {
    const userId = req.user._id;
    const { teamToken } = req.body;
    console.log(teamToken);

    if (!userId || !teamToken) return res.status(400).json({ msg: "Invalid request, please try again" });

    const teamFilter = { token: teamToken };

    Team.findOne(teamFilter)
        .then((doc) => {
            if (!doc) return res.status(404).json({ msg: "Team doesn't exist, please try again" });

            const filter = { _id: userId };
            const update = { $set: { teamToken } };

            User.findOneAndUpdate(filter, update)
                .then((doc) => {
                    if (!doc) return res.status(400).json({ msg: "Failed to join team, please try again" });
                    return res.status(200).json({ msg: "You have successfully joined a team!" });
                })
                .catch((error) => {
                    console.log("Join team: " + error);
                    return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
                });

        })
        .catch((error) => {
            console.log("Join team: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

// @route DELETE /
// @description Delete team
// @access Private & Creator only
router.delete("/", auth, (req, res) => {
    const userId = req.user._id;
    const { teamToken } = req.body;

    if (!teamToken) return res.status(400).json({ msg: "Invalid request, please try again" });

    const filter = { createdBy: userId };

    Team.findOne(filter)
        .then((doc) => {
            if (!doc) return res.status(401).json({ msg: "You are not allowed to use this feature" });

            const teamFilter = { token: teamToken };

            Team.findOneAndRemove(teamFilter)
                .then((found) => {
                    if (!found) return res.status(400).json({ msg: "Invalid request, please try again" });

                    const userFilter = { teamToken };
                    const userUpdate = { $set: { teamToken: "", isAdmin: false } };
                    const options = { multi: true };
                    const callback = (error) => {
                        if (error) return res.status({ msg: "Failed to remove teammembers, please try again" });
                    }
                    User.updateMany(userFilter, userUpdate, options, callback)
                    return res.status(200).json({ msg: "You successfully deleted the team" });
                })
                .catch((error) => {
                    console.log("Delete team: " + error);
                    return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
                });
        })
        .catch((error) => {
            console.log("Find user: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
})

module.exports = router;