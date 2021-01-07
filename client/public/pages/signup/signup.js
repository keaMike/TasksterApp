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
        addMsgToStorage("Please fill out all required fields *", "danger");
    } else {
        if (password !== repassword) {
            addMsgToStorage("Passwords don't match, try again", "danger");
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
                data: JSON.stringify(user),
                success: (data) => {
                    addMsgToStorage(data.msg, "success");
                    setTimeout(() => window.location = "/confirm", 2000);
                },
                error: (error) => {
                    addMsgToStorage(error.responseJSON.msg, "danger");
                }
            });
        };
    };
};
