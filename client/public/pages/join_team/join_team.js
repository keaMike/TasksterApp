$(".jointeam-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    joinTeam();
});


const joinTeam = () => {
    const teamToken = $("#teamToken").val();

    if (!teamToken) {
        addMsgToStorage("Invalid team token, try again", "danger");
    } else {
        const token = localStorage.getItem("token");
        const body = {
            teamToken
        };

        $.ajax({
            type: "PATCH",
            url: "/api/teams/join",
            contentType: "application/json",
            headers: {
                "auth-token": token
            },
            dataType: 'json',
            data: JSON.stringify(body),
            success: async (data) => {
                await updateLocalStorage();
                addMsgToStorage(data.msg, "success");
                setTimeout(() => window.location = "/", 2000);
            },
            error: (error) => {
                addMsgToStorage(error.responseJSON.msg, "danger");
                const status = error.responseJSON.sessionExpired
                if (status) toggleSessionModal();
            }
        });
    };
};