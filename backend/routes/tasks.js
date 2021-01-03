const auth = require("../middleware/auth");
const Task = require("../models/Task");
const { verifyUserAsAdmin } = require("../utils/adminAuth");

const router = require("express").Router();

// @route GET /
// @description Get tasks by team token
// @access Private
router.get("/teamtasks/:teamToken", auth, (req, res) => {
    const teamToken = req.params.teamToken;
    const filter = { teamToken };
    const sort = { createdAt: -1 }

    Task.find(filter)
        .sort(sort)
        .then((doc) => {
            if (!doc) return res.status(400).json({ msg: "Invalid request, try again" })
            return res.status(200).json({ tasks: doc });
        })
        .catch((error) => {
            console.log("Get tasks by team token" + error);
            if (error) return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

// @route GET /mytasks
// @description Get assigned tasks by user ID
// @access Private
router.get("/mytasks", auth, (req, res) => {
    const _id = req.user._id;
    const filter = { assignedTo: _id };
    const sort = { createdAt: -1 };

    Task.find(filter)
        .sort(sort)
        .then((doc) => {
            if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ tasks: doc });
        })
        .catch((error) => {
            console.log("Get assigned tasks by ID " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

// @route POST /
// @description Create task
// @access Private & Admin Only
router.post("/", auth, async (req, res) => {
    const userId = req.user._id;
    const { teamToken, title, description, price, createdBy } = req.body;

    if (!teamToken || !description || !price || !createdBy) return res.status(400).json({ msg: "Invalid request, try again" });

    const task = new Task({
        teamToken,
        title,
        description,
        price,
        createdBy
    });

    const verified = await verifyUserAsAdmin(userId);
    if (verified) {
        task.save()
            .then((doc) => {
                if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
                return res.status(200).json({ msg: "Task was successfully created!" });
            })
            .catch((error) => {
                console.log("Create task " + error);
                return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
            });
    } else {
        return res.status(401).json({ msg: "You are not allowed to use this feature" });
    };

});

// @route PATCH /assign
// @description Assign task to user
// @access Private
router.patch("/assign", auth, (req, res) => {
    const userId = req.user._id;
    const { taskId } = req.body;

    if (!userId || !taskId) return res.status(400).json({ msg: "Invalid request, try again" });

    const filter = { _id: taskId };
    const update = { $set: { assignedTo: userId } };

    Task.findOneAndUpdate(filter, update)
        .then((doc) => {
            if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ msg: "Task was successfullly assigned to you!" });
        })
        .catch((error) => {
            console.log("Assign task: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

// @route PATCH /unassign
// @description Unassign task
// @access Private
router.patch("/unassign", auth, (req, res) => {
    const userId = req.user._id;
    const { taskId } = req.body;

    if (!userId || !taskId) return res.status(400).json({ msg: "Invalid request, try again" });

    const filter = { _id: taskId };
    const update = { $set: { assignedTo: "" } };

    Task.findOneAndUpdate(filter, update)
        .then((doc) => {
            if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ msg: "Task was successfullly unassigned!" });
        })
        .catch((error) => {
            console.log("Unassign task: " + error);
            return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
        });
});

// @route PATCH /
// @description Update task
// @access Private & Admin Only
router.patch("/", auth, async (req, res) => {
    const userId = req.user._id;
    const { _id, title, description, price } = req.body;

    if (!_id || !title || !description || !price) return res.status(400).json({ msg: "Invalid request, try again" });

    const verified = await verifyUserAsAdmin(userId);
    if (verified) {
        const filter = { _id };
        const update = { $set: { title, description, price } };

        Task.findOneAndUpdate(filter, update)
            .then((doc) => {
                if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
                return res.status(200).json({ msg: "Task was successfully updated" });
            })
            .catch((error) => {
                console.log("Update task " + error);
                return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
            });

    } else {
        return res.status(401).json({ msg: "You are not allowed to use this feature" });
    };
});

// @route PATCH /complete
// @description Complete task
// @access Private & Admin Only
router.patch("/complete/:id", auth, async (req, res) => {
    const userId = req.user._id;
    const _id = req.params.id;

    if (!_id) return res.status(400).json({ msg: "Invalid request, try again" });

    const verified = await verifyUserAsAdmin(userId);
    if (verified) {
        const filter = { _id };
        const update = { $set: { isCompleted: true } };

        Task.findOneAndUpdate(filter, update)
            .then((doc) => {
                if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
                return res.status(200).json({ msg: "Task was successfully completed" });
            })
            .catch((error) => {
                console.log("Complete task " + error);
                return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
            });

    } else {
        return res.status(401).json({ msg: "You are not allowed to use this feature" });
    };
});

// @route PATCH /uncomplete
// @description Uncomplete task
// @access Private & Admin Only
router.patch("/uncomplete/:id", auth, async (req, res) => {
    const userId = req.user._id;
    const _id = req.params.id;

    if (!_id) return res.status(400).json({ msg: "Invalid request, try again" });

    const verified = await verifyUserAsAdmin(userId);
    if (verified) {
        const filter = { _id };
        const update = { $set: { isCompleted: false } };

        Task.findOneAndUpdate(filter, update)
            .then((doc) => {
                if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
                return res.status(200).json({ msg: "Task was successfully uncompleted" });
            })
            .catch((error) => {
                console.log("Complete task " + error);
                return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
            });

    } else {
        return res.status(401).json({ msg: "You are not allowed to use this feature" });
    };
});

// @route DELETE /:id
// @description Delete task
// @access Private & Admin Only
router.delete("/:id", auth, async (req, res) => {
    const userId = req.user._id;
    const _id = req.params.id;

    const verified = await verifyUserAsAdmin(userId);
    if (verified) {
        const filter = { _id };

        Task.findOneAndRemove(filter)
            .then((doc) => {
                if (!doc) return res.status(400).json({ msg: "Invalid request, try again" });
                return res.status(200).json({ msg: "Task has successfully been deleted" });
            })
            .catch((error) => {
                console.log("Delete task " + error);
                return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
            });

    } else {
        return res.status(401).json({ msg: "You are not allowed to use this feature" });
    };
});

module.exports = router;