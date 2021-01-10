$(".createteam-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    createTeam();
});

const createTeam = () => {
    const teamname = $("#teamname").val();

    if (!teamname) {
        addMsgToStorage("Invalid team name, try again", "danger");
    } else {
        const token = localStorage.getItem("token");

        const body = {
            teamname,
        };

        $.ajax({
            type: "POST",
            url: "/api/teams",
            contentType: "application/json",
            headers: {
                "auth-token": token
            },
            data: JSON.stringify(body),
            success: async (data) => {
                addMsgToStorage(data.msg, "success");
                await updateLocalStorage();
                setTimeout(() => window.location = "/", 2000);
            },
            error: (error) => {
                addMsgToStorage(error.responseJSON.msg, "danger");
                const status = error.responseJSON.sessionExpired
                if (status) toggleSessionModal();
            }
        });
    }
};
