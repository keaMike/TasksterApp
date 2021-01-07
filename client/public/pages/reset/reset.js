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
        addMsgToStorage("Please fill out both password fields", "danger");
    } else {
        if (password !== repassword) {
            addMsgToStorage("Passwords don't match, try again", "danger");
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
                    addMsgToStorage(data.msg, "success");
                    setTimeout(() => window.location = "/", 2000);
                },
                error: (error) => {
                    addMsgToStorage(error.responseJSON.msg, "danger");
                }
            });
        };
    };
};