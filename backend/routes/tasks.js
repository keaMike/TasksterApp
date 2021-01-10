const router = require("express").Router();
const Task = require("../models/Task");
const { auth } = require("../middleware/auth");
const { isUserAdmin } = require("../utils/adminAuth");

// @route GET /
// @description Get tasks by team token
// @access Private
router.get("/teamtasks/:teamToken", auth, async (req, res) => {
    try {
        const teamToken = req.params.teamToken;
        const filter = { teamToken };
        const sort = { createdAt: -1 };

        const tasks = await Task.find(filter).sort(sort);

        if (!tasks) return res.status(400).json({ msg: "Invalid request, try again" });
        return res.status(200).json({ tasks: tasks });

    } catch (error) {
        console.log("Get tasks by team token" + error);
        if (error) return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route GET /mytasks
// @description Get assigned tasks by user ID
// @access Private
router.get("/mytasks", auth, async (req, res) => {
    try {
        const _id = req.user._id;
        const filter = { assignedTo: _id };
        const sort = { createdAt: -1 };

        const tasks = await Task.find(filter).sort(sort);

        if (!tasks) return res.status(400).json({ msg: "Invalid request, try again" });
        return res.status(200).json({ tasks });

    } catch (error) {
        console.log("Get assigned tasks by ID " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route POST /
// @description Create task
// @access Private & Admin Only
router.post("/", auth, async (req, res) => {
    try {
        const _id = req.user._id;
        const { teamToken, title, description, price, createdBy } = req.body;

        if (!teamToken || !description || !price || !createdBy) return res.status(400).json({ msg: "Invalid request, try again" });

        const task = new Task({
            teamToken,
            title,
            description,
            price,
            createdBy
        });

        const isVerified = await isUserAdmin(_id);

        if (isVerified) {
            const savedTask = await task.save();

            if (!savedTask) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ task: savedTask, msg: "Task was successfully created!" });
        } else {
            return res.status(401).json({ msg: "You are not allowed to use this feature" });
        };
    } catch (error) {
        console.log("Create task " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route PATCH /assign
// @description Assign task to member
// @access Private
router.patch("/assign", auth, async (req, res) => {
    try {
        const _id = req.user._id;
        const { userId, taskId, firstname, lastname } = req.body;

        if (!taskId || !firstname || !lastname) return res.status(400).json({ msg: "Invalid request, try again" });

        const assignedTo = userId ? userId : _id;

        const filter = { _id: taskId };
        const update = { $set: { assignedTo } };

        const task = await Task.findOneAndUpdate(filter, update);

        if (!task) return res.status(400).json({ msg: "Invalid request, try again" });

        return res.status(200).json({ msg: `Task was successfullly assigned to ${firstname} ${lastname}!` });

    } catch (error) {
        console.log("Assign task: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };

});

// @route PATCH /unassign
// @description Unassign task
// @access Private
router.patch("/unassign", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { taskId } = req.body;

        if (!userId || !taskId) return res.status(400).json({ msg: "Invalid request, try again" });

        const filter = { _id: taskId };
        const update = { $set: { assignedTo: "" } };

        const task = await Task.findOneAndUpdate(filter, update);

        if (!task) return res.status(400).json({ msg: "Invalid request, try again" });
        return res.status(200).json({ msg: "Task was successfullly unassigned!" });

    } catch (error) {
        console.log("Unassign task: " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route PATCH /
// @description Update task
// @access Private & Admin Only
router.patch("/", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { taskId, title, description, price } = req.body;

        if (!taskId || !title || !description || !price) return res.status(400).json({ msg: "Invalid request, try again" });

        const isVerified = await isUserAdmin(userId);

        if (isVerified) {
            const filter = { _id: taskId };
            const update = { $set: { title, description, price } };

            const task = await Task.findOneAndUpdate(filter, update);

            if (!task) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ msg: "Task was successfully updated" });
        } else {
            return res.status(401).json({ msg: "You are not allowed to use this feature" });
        };
    } catch (error) {
        console.log("Update task " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };

});

// @route PATCH /complete
// @description Complete task
// @access Private & Admin Only
router.patch("/complete/:id", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const _id = req.params.id;

        if (!_id) return res.status(400).json({ msg: "Invalid request, try again" });

        const isVerified = await isUserAdmin(userId);

        if (isVerified) {
            const filter = { _id };
            const update = { $set: { isCompleted: true, assignedTo: "" } };

            const task = await Task.findOneAndUpdate(filter, update);

            if (!task) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ msg: "Task was successfully completed" });
        } else {
            return res.status(401).json({ msg: "You are not allowed to use this feature" });
        };
    } catch (error) {
        console.log("Complete task " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route PATCH /uncomplete
// @description Uncomplete task
// @access Private & Admin Only
router.patch("/uncomplete/:id", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const _id = req.params.id;

        if (!_id) return res.status(400).json({ msg: "Invalid request, try again" });

        const isVerified = await isUserAdmin(userId);

        if (isVerified) {
            const filter = { _id };
            const update = { $set: { isCompleted: false } };

            const task = await Task.findOneAndUpdate(filter, update)

            if (!task) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ msg: "Task was successfully uncompleted" });
        } else {
            return res.status(401).json({ msg: "You are not allowed to use this feature" });
        };
    } catch (error) {
        console.log("Complete task " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

// @route DELETE /:id
// @description Delete task
// @access Private & Admin Only
router.delete("/:id", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const _id = req.params.id;

        const isVerified = await isUserAdmin(userId);

        if (isVerified) {
            const filter = { _id };

            const task = await Task.findOneAndRemove(filter);

            if (!task) return res.status(400).json({ msg: "Invalid request, try again" });
            return res.status(200).json({ msg: "Task has successfully been deleted" });
        } else {
            return res.status(401).json({ msg: "You are not allowed to use this feature" });
        };
    } catch (error) {
        console.log("Delete task " + error);
        return res.status(500).json({ msg: "Something went wrong... Try again later or contact us" });
    };
});

module.exports = router;