$(".reset-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    resetPassword();
});

const resetPassword = () => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");

    const password = $("#password").val();
    const repassword = $("#repassword").val();

    if (!password || !repassword) {
        $(".user-alert").append('<div class="alert alert-danger" role="alert">Please fill out both password fields</div>');
    } else {
        if (password !== repassword) {
            console.log(password, repassword);
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">Passwords don't match, try again</div>`);
        } else {
            const user = {
                token: id,
                password
            };

            $.ajax({
                type: "PATCH",
                url: "/api/users/reset",
                contentType: "application/json",
                dataType: "json",
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
};