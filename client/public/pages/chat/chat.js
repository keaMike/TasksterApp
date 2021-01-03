const socket = io();

$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user === null) {
        window.location = "/404";
    } else if (!user.teamToken) {
        window.location = "/404";
    };

    const message = {
        from: user.firstname,
        team: user.teamToken,
        textContent: " joined",
        timestamp: getFullDate()
    };
    socket.emit("joined", { data: message });
});

let isTypingEmitted = false;
let isStoppedTypingEmitted = false;

$("#message").on("input", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const message = $("#message").val();

    if (message) {
        const message = {
            from: user.firstname,
            team: user.teamToken,
            textContent: " is typing",
            timestamp: getFullDate()
        };

        if (!isTypingEmitted) {
            socket.emit("typing", { data: message });
            isTypingEmitted = true;
            isStoppedTypingEmitted = false;
        };

    } else {
        const message = {
            from: user.firstname,
            team: user.teamToken,
            textContent: " stopped typing",
            timestamp: getFullDate()
        };

        if (!isStoppedTypingEmitted) {
            socket.emit("stopped-typing", { data: message });
            isStoppedTypingEmitted = true;
            isTypingEmitted = false;
        }
    };
});


$(".chat-form").on("submit", (event) => {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    const textContent = $("#message").val();
    $("#message").val("");

    if (textContent) {
        isTypingEmitted = false;
        isStoppedTypingEmitted = false;

        const message = {
            from: user.firstname,
            team: user.teamToken,
            textContent,
            timestamp: getFullDate()
        };

        socket.emit("sending-message", { data: message });

        $(".messages").prepend(`
            <div class="message-row your-message">
                <div class="message-content">
                    <div class="message-text">You: ${message.textContent}</div>
                    <div class="message-time">${message.timestamp}</div>
                </div>
            </div>
        `);
    };
});

socket.on("update-messages", (data) => {
    $(".messages").prepend(`
        <div class="message-row other-message">
            <div class="message-content">
                <div class="message-text">${data.message.from}: ${data.message.textContent}</div>
                <div class="message-time">${data.message.timestamp}</div>
            </div>
        </div>
    `);
});

const getFullDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const timestamp = `${day}-${month}-${year}`;
    return timestamp;
};