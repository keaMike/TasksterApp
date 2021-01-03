$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user === null) {
        window.location = "/404";
    } else if (!user.teamToken) {
        window.location = "/404";
    }

    if (!user.isAdmin) {
        $(".add-task-btn").remove();
        $(".add-modal").remove();
        $(".edit-modal").remove();
    }
    getTasks();
});

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
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            const status = error.responseJSON.sessionExpired
            if (status) toggleSessionModal();
        }
    });
};

const appendTasksToView = (data) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const taskArray = data.tasks;
    const tasks = $(".tasks");
    tasks.empty();
    let rowNo = 1;
    tasks.append(`<div class="task-row-${rowNo} row"></div>`);
    taskArray.forEach((task, index) => {
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
                        '<button type="button" class="btn btn-primary" onclick="assignTask(event)">Grab task</button>'
                        :
                        '<button type="button" disabled class="btn btn-primary">Assigned</button>'
                :
                task.isCompleted ?
                    '<button type="button" disabled class="btn btn-primary">Completed</button>'
                    :
                    !task.assignedTo ?
                        '<button type="button" class="btn btn-primary" onclick="completeTask(event)">Complete</button>' +
                        '<button type="button" class="btn btn-primary" onclick="assignTask(event)">Grab task</button>'
                        :
                        '<button type="button" class="btn btn-primary" onclick="completeTask(event)">Complete</button>' +
                        '<button type="button" disabled class="btn btn-primary"">Assigned</button>'
            }       
                    </div>
                </div>
            </div>    
        `)
        if ((index + 1) % 4 === 0) {
            rowNo++;
            tasks.append(`<div class="task-row-${rowNo} row"></div>`);
        }
    });
};

const refreshTasks = () => {
    $(".refresh-btn").addClass("spinner");
    getTasks();
    setTimeout(() => {
        $(".refresh-btn").removeClass("spinner");
    }, 1500);
};

const addTask = (e) => {
    e.preventDefault();

    $(".modal").modal("hide");

    const title = $("#title").val();
    const description = $("#description").val();
    const price = $("#price").val();
    const createdBy = JSON.parse(localStorage.getItem("user")).firstname;
    const teamToken = JSON.parse(localStorage.getItem("user")).teamToken;
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
            console.log(data.task);
            $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            const status = error.responseJSON.sessionExpired
            if (status) toggleSessionModal();
        }
    });
};

const updateTask = (event) => {
    event.preventDefault();
    $(".edit-modal").modal("hide");
    const token = localStorage.getItem("token");
    const _id = $("#edit-id").val();
    const title = $("#edit-title").val();
    const description = $("#edit-description").val();
    const price = $("#edit-price").val();

    if (!title || !description || !price) {
        $(".user-alert").append('<div class="alert alert-danger" role="alert">Please fill all fields</div>');
    } else {
        const body = {
            _id,
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
                $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
            },
            error: (error) => {
                $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
                const status = error.responseJSON.sessionExpired
                if (status) toggleSessionModal();
            }
        });
    }
};

const deleteTask = (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const id = $("#edit-id").val();

    $.ajax({
        type: "DELETE",
        url: "/api/tasks/" + id,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
            $(".edit-modal").modal("hide");
            $(`#${id}`).remove();
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            const status = error.responseJSON.sessionExpired
            if (status) toggleSessionModal();
        }
    });
};

const completeTask = (event) => {
    const token = localStorage.getItem("token");
    let target = event.target;
    while (target.className !== "card") {
        target = target.parentNode;
    }
    const id = target.id;
    const completeBtn = target.children[0].children[5];
    const assignBtn = target.children[0].children[6];
    $.ajax({
        type: "PATCH",
        url: "/api/tasks/complete/" + id,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
            completeBtn.setAttribute("disabled", true);
            completeBtn.textContent = "Completed";
            assignBtn.remove();
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            const status = error.responseJSON.sessionExpired
            if (status) toggleSessionModal();
        }
    });
};

const uncompleteTask = () => {
    $(".edit-modal").modal("hide");
    const token = localStorage.getItem("token");
    const id = $("#edit-id").val();
    const nodes = $(".tasks").find(".card");
    const target = Array.from(nodes).find((task) => task.id === id);
    const completeBtn = target.children[0].children[5];

    $.ajax({
        type: "PATCH",
        url: "/api/tasks/uncomplete/" + id,
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
            completeBtn.removeAttribute("disabled");
            completeBtn.textContent = "Complete";
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            const status = error.responseJSON.sessionExpired
            if (status) toggleSessionModal();
        }
    });
};

const assignTask = (event) => {
    const token = localStorage.getItem("token");
    let target = event.target;
    while (target.className !== "card") {
        target = target.parentNode;
    }
    const completeBtn = target.children[0].children[5];
    const assignBtn = target.children[0].children[6];

    const taskId = target.id;
    const body = {
        taskId
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
            $(".user-alert").append(`<div class="alert alert-success" role="alert">${data.msg}</div>`);
            completeBtn.remove();
            assignBtn.textContent = "Assigned";
            assignBtn.setAttribute("disabled", true);
        },
        error: (error) => {
            $(".user-alert").append(`<div class="alert alert-danger" role="alert">${error.responseJSON.msg}</div>`);
            const status = error.responseJSON.sessionExpired
            if (status) toggleSessionModal();
        }
    });
};

const toggleEditModal = (event) => {
    if (event.target.className !== "btn btn-primary") {
        $(".edit-modal").modal("toggle");
        let target = event.target;
        while (target.className !== "card") {
            target = target.parentNode;
        }
        const id = target.id;
        const title = target.children[0].children[0].textContent;
        const description = target.children[0].children[1].textContent;
        const price = target.children[0].children[2].textContent;

        $("#edit-id").val(id);
        $("#edit-title").val(title);
        $("#edit-description").val(description);
        $("#edit-price").val(price);
    };
};