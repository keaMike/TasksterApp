$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user.isAdmin) {
        addDeleteTeamBtn();
    };

    settingProfileFields(user);
});

const addDeleteTeamBtn = () => {
    $(".col-12")
        .append('<button class="delete-team-btn btn btn-danger" onclick="toggleDeleteAlert()">Delete team</button>')
        .append('<small class="d-block">Only allowed by the creator</small>');
};

const settingProfileFields = (user) => {
    $("#firstname").val(user.firstname);
    $("#lastname").val(user.lastname);
    $("#team-token").val(user.teamToken);
};

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
        addMsgToStorage("Please fill out firstname and lastname", "danger");
    };

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
            success: async (data) => {
                addMsgToStorage(data.msg, "success");
                await updateLocalStorage();
            },
            error: (error) => {
                addMsgToStorage(error.responseJSON.msg, "danger");
                const isExpired = error.responseJSON.sessionExpired;
                if (isExpired) toggleSessionModal();
            }
        });
    };

    if (password && confirmPassword) {
        if (password !== confirmPassword) {
            addMsgToStorage("Passwords doesn't match", "danger");
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
                success: async (data) => {
                    addMsgToStorage(data.msg, "success");
                    $("#password").val("");
                    $("#confirm-password").val("");
                    await updateLocalStorage();
                },
                error: (error) => {
                    addMsgToStorage(error.responseJSON.msg, "danger");
                    const isExpired = error.responseJSON.sessionExpired;
                    if (isExpired) toggleSessionModal();
                }
            });
        };
    };

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
            success: async (data) => {
                addMsgToStorage(data.msg, "success");
                await updateLocalStorage();
            },
            error: (error) => {
                addMsgToStorage(error.responseJSON.msg, "danger");
                const isExpired = error.responseJSON.sessionExpired;
                if (isExpired) toggleSessionModal();
            }
        });
    };
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
            addMsgToStorage(data.msg, "success");
            await updateLocalStorage();
            setTimeout(() => window.location = "/", 2000);
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
        }
    });
};