$(".signup-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    signUp();
});

const signUp = () => {
    const firstname = $("#firstname").val();
    const lastname = $("#lastname").val();
    const email = $("#email").val();
    const password = $("#password").val();
    const repassword = $("#repassword").val();
    const teamToken = $("#teamtoken").val();

    if (!firstname || !lastname || !email || !password || !repassword) {
        $(".user-alert").append('<div class="alert alert-danger" role="alert">Please fill out all fields</div>');
    } else {
        if (password !== repassword) {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">Passwords don't match, try again</div>`);
        } else {
            const user = {
                firstname,
                lastname,
                email,
                password,
                teamToken
            };

            $.ajax({
                type: "POST",
                url: "/api/users",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(user),
                success: (data) => {
                    localStorage.setItem("msg", data.msg);
                    window.location = "/confirm";
                },
                error: (error) => {
                    $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
                }
            });
        };
    };
};
