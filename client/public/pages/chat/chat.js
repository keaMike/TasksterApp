const socket = io();

$(document).ready(() => {
    checkIfUserOrMember();

    const user = JSON.parse(localStorage.getItem("user"));

    const message = {
        from: user.firstname,
        team: user.teamToken,
        textContent: " joined",
        timestamp: getFullDate()
    };
    socket.emit("joined", { data: message });
});

$(window).on("unload", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const leftMessage = {
        from: user.firstname,
        team: user.teamToken,
        textContent: " left the chat",
        timestamp: getFullDate()
    };
    socket.emit("left", { data: leftMessage });
});

let isTypingEmitted = false;

$("#message").on("input", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const message = $("#message").val();

    if (message) {
        const isTypingMessage = {
            from: user.firstname,
            team: user.teamToken,
            textContent: " is typing",
            timestamp: getFullDate()
        };

        if (!isTypingEmitted) {
            socket.emit("typing", { data: isTypingMessage });
            isTypingEmitted = true;
        };

    } else {
        const stoppedTypingMessage = {
            from: user.firstname,
            team: user.teamToken,
            textContent: " stopped typing",
            timestamp: getFullDate()
        };

        socket.emit("stopped-typing", { data: stoppedTypingMessage });
        isTypingEmitted = false;
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

        appendYourMessage(message);
    };
});

socket.on("update-messages", (data) => {
    appendOtherMessage(data);
});

const appendYourMessage = (message) => {
    $(".messages").prepend(`
        <div class="message-row your-message">
            <div class="message-content">
                <div class="message-text">You: ${message.textContent}</div>
                <div class="message-time">${message.timestamp}</div>
            </div>
        </div>
    `);
};

const appendOtherMessage = (data) => {
    $(".messages").prepend(`
        <div class="message-row other-message">
            <div class="message-content">
                <div class="message-text">${data.message.from}: ${data.message.textContent}</div>
                <div class="message-time">${data.message.timestamp}</div>
            </div>
        </div>
    `);
};

const getFullDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const timestamp = `${day}-${month}-${year}`;
    return timestamp;
};