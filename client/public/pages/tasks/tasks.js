$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    checkIfUserOrMember();

    if (user.isAdmin) {
        loadAdminFeatures();
    };

    getTasks();
});

const loadAdminFeatures = () => {
    $(`<button type="button" class="btn btn-primary add-task-btn" data-toggle="modal" data-target="#addTaskModal">
            Add task
        </button>`
    ).insertAfter(".refresh-btn");
    $(".container")
        .append(`<div class="addTaskModal"></div>`)
        .append(`<div class="editTaskModal"></div>`)
        .append(`<div class="assignTaskModal"></div>`);

    $(".addTaskModal").load("/pages/tasks/fragments/addTaskModal.html");
    $(".editTaskModal").load("/pages/tasks/fragments/editTaskModal.html");
    $(".assignTaskModal").load("/pages/tasks/fragments/assignTaskModal.html");
};

const getTasks = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    $.ajax({
        type: "GET",
        url: "/api/tasks/teamtasks/" + user.teamToken,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            appendTasksToView(data)
        },
        error: (error) => {
            const isExpired = error.responseJSON.sessionExpired
            if (isExpired) toggleSessionModal();
            addMsgToStorage(error.responseJSON.msg, "danger");
        }
    });
};

const appendTasksToView = (data) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const taskArray = data.tasks;
    let rowNo = 1;
    resetTaskView(rowNo);

    taskArray.forEach((task, index) => {
        appendTask(task, user, rowNo);
        if ((index + 1) % 4 === 0) {
            rowNo++;
            tasks.append(`<div class="task-row-${rowNo} row"></div>`);
        }
    });
};

const resetTaskView = (rowNo) => {
    const tasks = $(".tasks");
    tasks.empty();
    tasks.append(`<div class="task-row-${rowNo} row"></div>`);
};

const appendTask = (task, user, rowNo) => {
    $(`.task-row-${rowNo}`).append(`
        <div class="col-3">  
            <div class="card" id=${task._id}>
                <div class="card-body" onclick=toggleEditModal(event)>
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text">${task.price}</p>
                    <p class="card-text"><small class="text-muted">Created at ${task.createdAt.split("T")[0]}</small></p>
                    <p class="card-text"><small class="text-muted">By ${task.createdBy}</small></p>
                    ${!user.isAdmin ?
            task.isCompleted ?
                '<button type="button" disabled class="btn btn-primary">Completed</button>'
                :
                !task.assignedTo ?
                    '<button type="button" class="btn btn-primary" onclick="grabTask(event)">Grab task</button>'
                    :
                    '<button type="button" disabled class="btn btn-primary">Assigned</button>'
            :
            task.isCompleted ?
                '<button type="button" disabled class="btn btn-primary">Completed</button>'
                :
                !task.assignedTo ?
                    '<button type="button" class="btn btn-primary" onclick="completeTask(event)">Complete</button>' +
                    '<button type="button" class="btn btn-primary" onclick="toggleAssignModal(event)">Assign</button>'
                    :
                    '<button type="button" class="btn btn-primary" onclick="completeTask(event)">Complete</button>' +
                    '<button type="button" disabled class="btn btn-primary"">Assigned</button>'
        }       
                </div>
            </div>
        </div>    
    `);
};

const refreshTasks = () => {
    $(".refresh-btn").addClass("spinner");
    getTasks();
    setTimeout(() => {
        $(".refresh-btn").removeClass("spinner");
    }, 1500);
};

const addTask = (event) => {
    event.preventDefault();

    $(".modal").modal("hide");

    const title = $("#title").val();
    const description = $("#description").val();
    const price = $("#price").val();

    const user = JSON.parse(localStorage.getItem("user"));
    const createdBy = user.firstname;
    const teamToken = user.teamToken;
    const token = localStorage.getItem("token");

    const body = {
        title,
        description,
        price,
        createdBy,
        teamToken
    };

    $.ajax({
        type: "POST",
        url: "/api/tasks",
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        data: JSON.stringify(body),
        success: (data) => {
            addMsgToStorage(data.msg, "success");
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
        }
    });
};

const updateTask = (event) => {
    event.preventDefault();
    $(".edit-modal").modal("hide");
    const token = localStorage.getItem("token");
    const taskId = $("#edit-id").val();
    const title = $("#edit-title").val();
    const description = $("#edit-description").val();
    const price = $("#edit-price").val();

    if (!title || !description || !price) {
        addMsgToStorage("Please fill all fields", "danger");
    } else {
        const body = {
            taskId,
            title,
            description,
            price
        };

        $.ajax({
            type: "PATCH",
            url: "/api/tasks",
            contentType: "application/json",
            headers: {
                "auth-token": token
            },
            data: JSON.stringify(body),
            success: (data) => {
                addMsgToStorage(data.msg, "success");
            },
            error: (error) => {
                addMsgToStorage(error.responseJSON.msg, "danger");
                const isExpired = error.responseJSON.sessionExpired;
                if (isExpired) toggleSessionModal();
            }
        });
    }
};

const deleteTask = (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const taskId = $("#edit-id").val();

    $.ajax({
        type: "DELETE",
        url: "/api/tasks/" + taskId,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            addMsgToStorage(data.msg, "success");
            $(".edit-modal").modal("hide");
            $(`#${taskId}`).remove();
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
        }
    });
};

const completeTask = async (event) => {
    const token = localStorage.getItem("token");
    const target = await getCardElement(event.target);
    const taskId = target.id;
    const completeBtn = target.children[0].children[5];
    const assignBtn = target.children[0].children[6];

    $.ajax({
        type: "PATCH",
        url: "/api/tasks/complete/" + taskId,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            addMsgToStorage(data.msg, "success");
            completeBtn.setAttribute("disabled", true);
            completeBtn.textContent = "Completed";
            assignBtn.remove();
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
        }
    });
};

const uncompleteTask = () => {
    $(".edit-modal").modal("hide");
    const token = localStorage.getItem("token");
    const taskId = $("#edit-id").val();
    const nodes = $(".tasks").find(".card");
    const target = Array.from(nodes).find((task) => task.id === taskId);
    const completeBtn = target.children[0].children[5];

    if (completeBtn.textContent === "Complete") {
        addMsgToStorage("Task is already uncomplete", "danger");
    } else {
        $.ajax({
            type: "PATCH",
            url: "/api/tasks/uncomplete/" + taskId,
            contentType: "application/json",
            headers: {
                "auth-token": token
            },
            success: (data) => {
                addMsgToStorage(data.msg, "success");
                completeBtn.removeAttribute("disabled");
                completeBtn.textContent = "Complete";
            },
            error: (error) => {
                addMsgToStorage(error.responseJSON.msg, "danger");
                const isExpired = error.responseJSON.sessionExpired;
                if (isExpired) toggleSessionModal();
            }
        });
    };
};

const assignTask = (event) => {
    event.preventDefault();
    $(".assign-task-modal").modal("hide");
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const taskId = $("#task-id").val();
    const userId = $("#assign-task-select").val();
    const firstname = user.firstname;
    const lastname = user.lastname;
    const nodes = $(".tasks").find(".card");
    const target = Array.from(nodes).find((task) => task.id === taskId);
    const assignBtn = target.children[0].children[6];

    const body = {
        userId,
        taskId,
        firstname,
        lastname,
    };

    $.ajax({
        type: "PATCH",
        url: "/api/tasks/assign",
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        data: JSON.stringify(body),
        success: (data) => {
            addMsgToStorage(data.msg, "success");
            assignBtn.textContent = "Assigned";
            assignBtn.setAttribute("disabled", true);
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
        }
    });
};

const grabTask = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const firstname = user.firstname;
    const lastname = user.lastname;
    const target = await getCardElement(event.target);
    const taskId = target.id;
    const assignBtn = target.children[0].children[6];

    const body = {
        taskId,
        firstname,
        lastname,
    };

    $.ajax({
        type: "PATCH",
        url: "/api/tasks/assign",
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        data: JSON.stringify(body),
        success: (data) => {
            addMsgToStorage(data.msg, "success");
            assignBtn.textContent = "Assigned";
            assignBtn.setAttribute("disabled", true);
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
        }
    });
};

const toggleEditModal = async (event) => {
    if (event.target.className !== "btn btn-primary") {
        $(".edit-modal").modal("toggle");
        const target = await getCardElement(event.target);
        const taskId = target.id;
        const title = target.children[0].children[0].textContent;
        const description = target.children[0].children[1].textContent;
        const price = target.children[0].children[2].textContent;

        $("#edit-id").val(taskId);
        $("#edit-title").val(title);
        $("#edit-description").val(description);
        $("#edit-price").val(price);
    };
};

const toggleAssignModal = async (event) => {
    const token = localStorage.getItem("token");
    const teamToken = JSON.parse(localStorage.getItem("user")).teamToken;
    const target = await getCardElement(event.target);
    const taskId = target.id;
    $("#task-id").val(taskId);

    $.ajax({
        type: "GET",
        url: "/api/members/" + teamToken,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            appendMembersToSelect(data.members);
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
        }
    });

};

const appendMembersToSelect = (members) => {
    members.forEach((member) => {
        $("#assign-task-select").append(`<option value=${member._id}>${member.firstname} ${member.lastname}</option>`);
    });
    $(".assign-task-modal").modal("toggle");
};

const getCardElement = async (target) => {
    try {
        while (target.className !== "card") {
            target = target.parentNode;
        };
        return target;
    } catch (error) {
        addMsgToStorage("Something went wrong, try again later or contact us", "danger");
    };
};