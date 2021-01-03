$(".forgot-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    sendResetEmail();
});

const sendResetEmail = () => {
    const email = $("#email").val();

    if (!email) {
        $("#forgot-alert").append('<div class="alert alert-danger" role="alert">Invalid email, try again</div>');
    } else {
        const user = {
            email
        };

        $.ajax({
            type: "POST",
            url: "/api/users/forgot",
            contentType: "application/json",
            dataType: 'json',
            data: JSON.stringify(user),
            success: (data) => {
                localStorage.setItem("msg", data.msg);
                window.location = "/";
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            }
        })
    }
}