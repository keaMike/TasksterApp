$(document).ready(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('id');

    if (token) {
        const body = {
            token
        };

        $.ajax({
            type: "PATCH",
            url: "/api/users/confirm",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(body),
            success: (data) => {
                localStorage.setItem("msg", data.msg);
                window.location = "/";
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            }
        });
    };
});

$(".confirm-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    sendConfirmationEmail();
});

const sendConfirmationEmail = () => {
    const email = $("#email").val();

    if (!email) {
        $(".user-alert").append('<div class="alert alert-danger" role="alert">Please write a valid email</div>');
    } else {
        const body = {
            email
        };

        $.ajax({
            type: "POST",
            url: "/api/users/resend-confirm",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(body),
            success: (data) => {
                localStorage.setItem("msg", data.msg);
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            }
        });
    }
};