$(document).ready(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user === null) {
        window.location = "/404";
    } else if (!user.teamToken) {
        window.location = "/404";
    };

    getMyTasks();
});

const refreshMyTasks = () => {
    $(".refresh-btn").addClass("spinner");
    getMyTasks();
    setTimeout(() => {
        $(".refresh-btn").removeClass("spinner");
    }, 1500);
};

const getMyTasks = () => {
    const token = localStorage.getItem("token");

    $.ajax({
        type: "GET",
        url: "/api/tasks/mytasks",
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        success: (data) => {
            appendMyTasksToView(data);
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
        }
    });
};

const appendMyTasksToView = (data) => {
    const taskArray = data.tasks;
    let rowNo = 1;
    resetTaskView(rowNo);
    taskArray.forEach((task, index) => {
        appendMyTask(task, rowNo);

        if ((index + 1) % 4 === 0) {
            rowNo++;
            tasks.append(`<div class="task-row-${rowNo} row"></div>`);
        };
    });
};

const resetTaskView = (rowNo) => {
    const tasks = $(".tasks");
    tasks.empty();
    tasks.append(`<div class="task-row-${rowNo} row"></div>`);
};

const appendMyTask = (task, rowNo) => {
    $(`.task-row-${rowNo}`).append(`
        <div class="col-3">  
            <div class="card" id=${task._id}>
                <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text">${task.price}</p>
                    <p class="card-text"><small class="text-muted">Created at ${task.createdAt.split("T")[0]}</small></p>
                    <p class="card-text"><small class="text-muted">By ${task.createdBy}</small></p>
                    <button type="button" class="btn btn-primary" onclick="unassignTask(event)">Unassign</button>
                </div>
            </div>
        </div>    
    `);
};

const unassignTask = (event) => {
    const token = localStorage.getItem("token");
    let target = event.target;
    while (target.className !== "card") {
        target = target.parentNode;
    }
    const taskId = target.id;
    const body = {
        taskId
    };

    $.ajax({
        type: "PATCH",
        url: "/api/tasks/unassign",
        contentType: "application/json",
        headers: {
            "auth-token": token
        },
        data: JSON.stringify(body),
        success: (data) => {
            addMsgToStorage(data.msg, "success");
            $(`#${taskId}`).remove();
        },
        error: (error) => {
            addMsgToStorage(error.responseJSON.msg, "danger");
            const isExpired = error.responseJSON.sessionExpired;
            if (isExpired) toggleSessionModal();
        }
    });
};