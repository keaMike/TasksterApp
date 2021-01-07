$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    checkIfUserOrMember();

    if (user.isAdmin) {
        loadAdminFeatures();
    };

    getTeamMembers();
});

const loadAdminFeatures = () => {
    $(".container").append(`<div class="editMemberModal"></div>`);
    $(".editMemberModal").load("/pages/members/fragments/editMemberModal.html");
};

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
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
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

const refreshMembers = () => {
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
    const roleIndex = parseInt($("#edit-role").val());
    const id = $("#edit-id").val();
    const isAdmin = [false, true][roleIndex];

    const body = {
        isAdmin
    };

    $.ajax({
        type: "PATCH",
        url: "/api/members/" + id,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        data: JSON.stringify(body),
        success: (data) => {
            addMsgToStorage(data.msg, "success");
            updateLocalStorage();
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
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
        success: async (data) => {
            addMsgToStorage(data.msg, "success");
            $(`#${id}`).remove();
            await updateLocalStorage();
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
        }
    });
}