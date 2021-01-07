$(".signin-form").on("submit", (e) => {
    e.preventDefault();
    $(".alert").remove();
    login();
});

const login = () => {
    const email = $("#email").val();
    const password = $("#password").val();

    if (!email || !password) {
        addMsgToStorage("Invalid email or password, try again", "danger");
    } else {
        const user = {
            email,
            password
        };

        $.ajax({
            type: "POST",
            url: "/api/auth/signin",
            contentType: "application/json",
            data: JSON.stringify(user),
            success: (data) => {
                localStorage.setItem("token", data.token);
                localStorage.setItem("refreshToken", data.refreshToken);
                localStorage.setItem("user", JSON.stringify(data.user));
                addMsgToStorage(data.msg, "success");
                setTimeout(() => window.location = "/", 2000);
            },
            error: (error) => {
                addMsgToStorage(error.responseJSON.msg, "danger");
            }
        });
    }
}