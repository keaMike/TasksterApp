$(".createteam-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    createTeam();
});

const createTeam = () => {
    const teamname = $("#teamname").val();

    if (!teamname) {
        $(".user-alert").append('<div class="alert alert-danger" role="alert">Invalid team name, try again</div>');
    } else {
        const token = localStorage.getItem("token");
        const body = {
            teamname,
        };

        $.ajax({
            type: "POST",
            url: "/api/teams",
            contentType: "application/json;charset=utf-8",
            headers: {
                "auth-token": token
            },
            dataType: 'json',
            data: JSON.stringify(body),
            success: async (data) => {
                localStorage.setItem("msg", data.msg);
                await updateLocalStorage();
                window.location = "/";
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
                const status = error.responseJSON.sessionExpired
                if (status) toggleSessionModal();
            }
        });
    }
};
