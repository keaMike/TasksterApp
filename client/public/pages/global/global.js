$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setNavbar(user);
    setFooter();
    setCookieConsent();
    windowSizeListener();
});

const setNavbar = (user) => {
    if (!user) {
        $(".navbar").load("/pages/fragments/guestnavbar.html");
    } else if (!user.teamToken) {
        $(".navbar").load("/pages/fragments/usernavbar.html");
    } else {
        $(".navbar").load("/pages/fragments/membernavbar.html");
    };
};

const setFooter = () => {
    $(".footer").load("pages/fragments/footer.html");
};

const setCookieConsent = () => {
    $.get("/pages/fragments/cookieconsent.html", (data) => {
        $("body").append(data);
    });
};

const addMsgToStorage = (msg, type) => {
    localStorage.setItem("msg", msg);
    showMsg(type);
};

const showMsg = (type) => {
    const msg = localStorage.getItem("msg");
    if (msg) {
        $(".user-alert").append(`<div class="alert alert-${type}" role="alert">${msg}</div>`)
        localStorage.removeItem("msg");
        removeAlertAfterTimeout();
    };
};

const removeAlertAfterTimeout = () => {
    setTimeout(() => {
        $(".alert").remove();
    }, 5000);
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
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            addMsgToStorage(data.msg, "success");
            setTimeout(() => window.location = "/", 2000);
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
        }
    });
};

const updateLocalStorage = async () => {
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
            return;
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            throw new Error();
        }
    });
};

const checkIfUserOrMember = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user === null) {
        window.location = "/404";
    } else if (!user.teamToken) {
        window.location = "/404";
    };
};

const toggleSessionModal = () => {
    $(".session-modal").modal("toggle");
};

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
            addMsgToStorage(data.msg, "success");
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
        }
    });
};

const windowSizeListener = () => {
    const numberOfRows = $(".row").length;

    if (numberOfRows > 1) {
        window.addEventListener('resize', () => {
            const windowWidth = $(window).width();

            if (windowWidth < 1000) {
                $(".col-6").removeClass("col-6").addClass("col-12");
                $(".home-image").hide();
            } else {
                $(".col-12").removeClass("col-12").addClass("col-6");
                $(".home-image").show();
            };
        });
    };
};
