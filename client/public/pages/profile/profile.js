$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user.isAdmin) {
        $(".col-12").append('<button class="delete-team-btn btn btn-danger" onclick="toggleDeleteAlert()">Delete team</button>');
        $(".col-12").append('<small class="d-block">Only allowed by the creator</small>');
    };

    $("#firstname").val(user.firstname);
    $("#lastname").val(user.lastname);
    $("#team-token").val(user.teamToken);
});

const updateProfile = (event) => {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    const currentTeamToken = user.teamToken;
    const currentFirstname = user.firstname;
    const currentLastname = user.lastname;

    const firstname = $("#firstname").val();
    const lastname = $("#lastname").val();
    const password = $("#password").val();
    const confirmPassword = $("#confirm-password").val();
    const teamToken = $("#team-token").val();
    const token = localStorage.getItem("token");

    if (!firstname || !lastname) {
        $(".user-alert").append(`<div class="alert alert-danger" role="alert">Please fill out firstname and lastname</div>`);
    }

    if (firstname !== currentFirstname || lastname !== currentLastname) {
        const body = {
            firstname,
            lastname
        };

        $.ajax({
            type: "PATCH",
            url: "/api/users",
            contentType: "application/json",
            headers: {
                "auth-token": token
            },
            data: JSON.stringify(body),
            success: (data) => {
                $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
                const status = error.responseJSON.sessionExpired
                if (status) toggleSessionModal();
            }
        });
    }

    if (password && confirmPassword) {
        if (password !== confirmPassword) {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">Passwords doesn't match</div>`);
        } else {
            const body = {
                password,
                token
            };

            $.ajax({
                type: "PATCH",
                url: "/api/users/reset",
                contentType: "application/json",
                data: JSON.stringify(body),
                success: (data) => {
                    $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
                    $("#password").val("");
                    $("#confirm-password").val("");
                },
                error: (error) => {
                    $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
                    const status = error.responseJSON.sessionExpired
                    if (status) toggleSessionModal();
                }
            });
        }
    }

    if (teamToken && teamToken !== currentTeamToken) {
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
            data: JSON.stringify(body),
            success: (data) => {
                $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
                const status = error.responseJSON.sessionExpired
                if (status) toggleSessionModal();
            }
        });
    };
    updateLocalStorage();
};

const toggleDeleteAlert = () => {
    if (confirm("Are you sure you want to delete the team?")) {
        deleteTeam();
    };
};

const deleteTeam = () => {
    const token = localStorage.getItem("token");
    const teamToken = JSON.parse(localStorage.getItem("user")).teamToken;

    const body = {
        teamToken
    };

    $.ajax({
        type: "DELETE",
        url: "/api/teams",
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
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
};