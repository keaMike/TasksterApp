$(".jointeam-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    joinTeam();
});


const joinTeam = () => {
    const teamToken = $("#teamToken").val();

    if (!teamToken) {
        $(".user-alert").append('<div class="alert alert-danger" role="alert">Invalid team token, try again</div>');
    } else {
        const token = localStorage.getItem("token");
        const body = {
            teamToken
        };

        $.ajax({
            type: "PATCH",
            url: "/api/teams",
            contentType: "application/json",
            headers: {
                "auth-token": token
            },
            dataType: 'json',
            data: JSON.stringify(body),
            success: (data) => {
                updateLocalStorage()
                    .then(() => {
                        localStorage.setItem("msg", data.msg);
                        window.location = "/";
                    })
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
                const status = error.responseJSON.sessionExpired
                if (status) toggleSessionModal();
            }
        });
    };
};