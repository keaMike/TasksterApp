$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        $(".navbar").load("/pages/fragments/guestnavbar.html");
    } else {
        if (!user.teamToken) {
            $(".navbar").load("/pages/fragments/usernavbar.html");
        } else {
            $(".navbar").load("/pages/fragments/membernavbar.html");
        }
    }

    $(".footer").load("pages/fragments/footer.html");

    showMsg();
    removeAlert();
});

const removeAlert = () => {
    setInterval(() => {
        $(".alert").remove();
    }, 5000);
};

const showMsg = () => {
    const msg = localStorage.getItem("msg");

    if (msg) {
        $(".user-alert").append(`<div class="alert alert-success" role="alert">${msg}</div>`)
        localStorage.removeItem("msg");
    };
};

const signOut = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const body = {
        refreshToken
    };

    $.ajax({
        type: "DELETE",
        url: "/api/auth/signout",
        contentType: "application/json",
        data: JSON.stringify(body),
        success: (data) => {
            localStorage.setItem("msg", data.msg);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location = "/";
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`)
        }
    });
};

const updateLocalStorage = () => {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem("token");
        $.ajax({
            type: "GET",
            url: "/api/auth/user",
            contentType: "application/json",
            headers: {
                "auth-token": token
            },
            success: (data) => {
                localStorage.setItem("user", JSON.stringify(data.userDTO));
                resolve();
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
                reject();
            }
        });
    });
};

const toggleSessionModal = () => {
    $(".session-modal").modal("toggle");
}

const getNewAccessToken = () => {
    $(".session-modal").modal("hide");
    const refreshToken = localStorage.getItem("refreshToken");
    const body = {
        refreshToken
    };

    $.ajax({
        type: "POST",
        url: "/api/auth/token",
        contentType: "application/json",
        data: JSON.stringify(body),
        success: (data) => {
            localStorage.setItem("token", data.token);
            $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
        }
    });
};