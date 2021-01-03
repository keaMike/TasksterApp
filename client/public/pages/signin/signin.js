$(".signin-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    login();
});

const login = () => {
    const email = $("#email").val();
    const password = $("#password").val();

    if (!email || !password) {
        $(".user-alert").append('<div class="alert alert-danger" role="alert">Invalid email or password, try again</div>');
    } else {
        const user = {
            email,
            password
        };

        $.ajax({
            type: "POST",
            url: "/api/auth/signin",
            contentType: "application/json;charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(user),
            success: (data) => {
                localStorage.setItem("token", data.token);
                localStorage.setItem("refreshToken", data.refreshToken);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("msg", data.msg);
                window.location = "/";
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            }
        });
    }
}