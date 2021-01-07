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
                addMsgToStorage(data.msg, "success");
                setTimeout(() => window.location = "/", 2000);
            },
            error: (error) => {
                addMsgToStorage(error.responseJSON.msg);
            }
        });
    };
};