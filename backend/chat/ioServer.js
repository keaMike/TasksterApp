const instantiateSocketServer = (server) => {
    console.log("Instantiating socket io server...");
    const io = require("socket.io")(server);

    io.on("connection", (socket) => {
        socket.on("joined", (res) => {
            socket.join(res.data.team);
            socket.to(res.data.team).emit("update-messages", { message: res.data });
        });

        socket.on("left", (res) => {
            socket.to(res.data.team).emit("update-messages", { message: res.data });
        });

        socket.on("sending-message", (res) => {
            socket.to(res.data.team).emit("update-messages", { message: res.data });
        });

        socket.on("typing", (res) => {
            socket.to(res.data.team).emit("update-messages", { message: res.data });
        });

        socket.on("stopped-typing", (res) => {
            socket.to(res.data.team).emit("update-messages", { message: res.data });
        });
    });
};

module.exports = {
    instantiateSocketServer
};