$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user === null) {
        window.location = "/404";
    } else if (!user.teamToken) {
        window.location = "/404";
    }

    if (!user.isAdmin) {
        $(".edit-modal").remove();
    }
    getTeamMembers();
});

const getTeamMembers = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    $.ajax({
        type: "GET",
        url: "/api/members/" + user.teamToken,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            appendTeamMebersToView(data);
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            const status = error.responseJSON.sessionExpired
            if (status) toggleSessionModal();
        }
    });
};

const appendTeamMebersToView = (data) => {
    const membersArray = data.members;
    const members = $(".members");
    members.empty();
    let rowNo = 1;
    let colNo = 1;
    members.append(`<div class="task-row-${rowNo} row"></div>`);
    membersArray.forEach((member, index) => {
        $(`.task-row-${rowNo}`).append(`
            <div class="task-col-${colNo} col-3">  
                <div class="card" id=${member._id} onclick="toggleEditModal(event)">
                <img class="card-img-top" src="../images/profile.svg" alt="profile"/>
                    <div class="card-body">
                        <h5 class="card-title">${member.firstname} ${member.lastname}</h5>
                        <p class="card-text"><small class="text-muted">${member.isAdmin ? "Admin" : "Member"}</small></p>
                    </div>
                </div>
            </div>    
        `)
        if ((index + 1) % 4 === 0) {
            rowNo++;
            members.append(`<div class="task-row-${rowNo} row"></div>`);
        }
        colNo++;
    });
}

const refresh = () => {
    $(".refresh-btn").addClass("spinner");
    getTeamMembers();
    setTimeout(() => {
        $(".refresh-btn").removeClass("spinner");
    }, 1500);
};

const toggleEditModal = (event) => {
    $(".edit-modal").modal("toggle");
    let target = event.target;
    while (target.className !== "card") {
        target = target.parentNode;
    }
    const id = target.id;
    const names = target.children[1].children[0].textContent.split(" ");
    $("#edit-firstname").val(names[0]);
    $("#edit-lastname").val(names.slice(1));
    $("#edit-id").val(id);
};

const updateMember = (event) => {
    event.preventDefault();
    $(".edit-modal").modal("hide");
    const token = localStorage.getItem("token");
    const role = $("#edit-role").val();
    const id = $("#edit-id").val();
    let isAdmin;
    switch (role) {
        case "0": {
            isAdmin = false;
            break;
        }
        case "1": {
            isAdmin = true;
            break;
        }
    };

    const body = {
        isAdmin
    }

    $.ajax({
        type: "PATCH",
        url: "/api/members/" + id,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        data: JSON.stringify(body),
        success: (data) => {
            $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
            updateLocalStorage();
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            const status = error.responseJSON.sessionExpired
            if (status) toggleSessionModal();
        }
    });
};

const removeMember = (event) => {
    event.preventDefault();
    $(".edit-modal").modal("hide");
    const token = localStorage.getItem("token");
    const id = $("#edit-id").val();

    $.ajax({
        type: "PATCH",
        url: "/api/members/remove/" + id,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
            $(`#${id}`).remove();
            updateLocalStorage();
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            const status = error.responseJSON.sessionExpired
            if (status) toggleSessionModal();
        }
    });
}