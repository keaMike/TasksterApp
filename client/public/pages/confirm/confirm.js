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
                addMsgToStorage(data.msg, "success");
                setTimeout(() => window.location = "/", 2000);
            },
            error: (error) => {
                addMsgToStorage(error.repsonseJSON.msg, "danger");
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
                addMsgToStorage(data.msg, "success");
            },
            error: (error) => {
                addMsgToStorage(error.responseJSON.msg, "danger");
            }
        });
    }
};