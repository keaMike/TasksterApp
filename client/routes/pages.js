const router = require("express").Router();
const path = require("path");

const public = path.join(__dirname, "../public/pages");

router.get("/", (req, res) => {
    return res.sendFile("/home/home.html", { root: public });
});

router.get("/join-team", (req, res) => {
    return res.sendFile("/join_team/join_team.html", { root: public });
});

router.get("/create-team", (req, res) => {
    return res.sendFile("/create_team/create_team.html", { root: public });
});

router.get("/tasks", (req, res) => {
    return res.sendFile("/tasks/tasks.html", { root: public });
});

router.get("/mytasks", (req, res) => {
    return res.sendFile("/mytasks/mytasks.html", { root: public });
});

router.get("/members", (req, res) => {
    return res.sendFile("/members/members.html", { root: public });
});

router.get("/profile", (req, res) => {
    return res.sendFile("/profile/profile.html", { root: public });
});

router.get("/chat", (req, res) => {
    return res.sendFile("/chat/chat.html", { root: public });
});

router.get("/signin", (req, res) => {
    return res.sendFile("/signin/signin.html", { root: public });
});

router.get("/signup", (req, res) => {
    return res.sendFile("/signup/signup.html", { root: public });
});

router.get("/confirm", (req, res) => {
    return res.sendFile("/confirm/confirm.html", { root: public });
});

router.get("/forgot", (req, res) => {
    return res.sendFile("/forgot/forgot.html", { root: public });
});

router.get("/reset", (req, res) => {
    return res.sendFile("/reset/reset.html", { root: public });
});

router.get("/404", (req, res) => {
    return res.sendFile("/404/404.html", { root: public });
});

module.exports = router;
