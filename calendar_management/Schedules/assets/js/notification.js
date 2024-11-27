(function () {
    const baseUrl = "http://localhost:8080/api/notification"; // URL cơ bản của API
    const notificationContainer = document.querySelector(".accordion"); // Container cho thông báo
    const addNotificationBtn = document.getElementById("addNotificationBtn");
    const notificationForm = document.getElementById("notificationForm");
    const cancelBtn = document.getElementById("cancelBtn");
    const saveBtn = document.getElementById("saveBtn");

    const notificationTitleInput = document.getElementById("notificationTitle");
    const notificationContentInput = document.getElementById("notificationContent");

    let isEditing = false;
    let editingNotificationId = null;

    // Lấy thông tin người dùng đã đăng nhập từ localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser || !loggedInUser.userId) {
        alert("User is not logged in");
        return;
    }

    // Gọi hàm tải thông báo khi bắt đầu
    loadNotifications(loggedInUser.userId);

    // Hàm tải thông báo từ API
    function loadNotifications(userId) {
        fetch(`${baseUrl}/user/${userId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch notifications");
                }
                return response.json();
            })
            .then((notifications) => {
                if (notifications.length === 0) {
                    console.log("No notifications found for this user.");
                }
                notifications.forEach((notification) => {
                    addNotificationToUI(notification.id, notification.title, notification.message);
                });
            })
            .catch((error) => {
                console.error("Error fetching notifications:", error);
                alert("An error occurred while fetching notifications.");
            });
    }

    // Hiển thị form thêm/sửa thông báo khi nhấn "Add Notification"
    addNotificationBtn.addEventListener("click", () => {
        isEditing = false;
        notificationForm.style.display = "block"; // Hiển thị form
        notificationTitleInput.value = "";
        notificationContentInput.value = "";
    });

    // Đóng form khi nhấn Cancel
    cancelBtn.addEventListener("click", () => {
        notificationForm.style.display = "none"; // Ẩn form
    });

    // Lưu hoặc cập nhật thông báo khi nhấn Save
    saveBtn.addEventListener("click", () => {
        const title = notificationTitleInput.value.trim();
        const content = notificationContentInput.value.trim();

        if (!title || !content) {
            alert("Please fill in both the title and content.");
            return;
        }

        const apiUrl = isEditing
            ? `${baseUrl}/update/${editingNotificationId}`
            : `${baseUrl}/add`;

        const method = isEditing ? "PUT" : "POST";

        fetch(apiUrl, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                message: content,
                timestamp: new Date().toISOString(),
                userId: loggedInUser.userId, // Thêm userId vào API
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to save notification");
                }
                return response.json();
            })
            .then((data) => {
                if (isEditing) {
                    updateNotificationUI(editingNotificationId, title, content);
                } else {
                    addNotificationToUI(data.id, title, content);
                }

                notificationForm.style.display = "none"; // Ẩn form sau khi lưu
                notificationTitleInput.value = "";
                notificationContentInput.value = "";
            })
            .catch((error) => {
                console.error(error);
                alert("An error occurred while saving the notification.");
            });
    });

    // Thêm thông báo vào UI
    function addNotificationToUI(id, title, content) {
        const newAccordion = document.createElement("div");
        newAccordion.classList.add("accordion-content");
        newAccordion.setAttribute("data-id", id);

        newAccordion.innerHTML = `
            <header>
                <span class="title">${title}</span>
                <i class="fa-solid fa-plus"></i>
            </header>
            <p class="description" style="height: 0px;">${content}</p>
            <div class="actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        const header = newAccordion.querySelector("header");
        const description = newAccordion.querySelector(".description");

        header.addEventListener("click", () => {
            const isOpen = newAccordion.classList.toggle("open");
            description.style.height = isOpen ? `${description.scrollHeight}px` : "0px";
            const icon = header.querySelector("i");
            icon.classList.toggle("fa-plus", !isOpen);
            icon.classList.toggle("fa-minus", isOpen);
        });

        const editBtn = newAccordion.querySelector(".edit-btn");
        editBtn.addEventListener("click", () => {
            isEditing = true;
            editingNotificationId = id;
            notificationForm.style.display = "block"; // Hiển thị form để sửa
            notificationTitleInput.value = title;
            notificationContentInput.value = content;
        });

        const deleteBtn = newAccordion.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete this notification?")) {
                fetch(`${baseUrl}/delete/${id}`, {
                    method: "DELETE",
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Failed to delete notification");
                        }
                        newAccordion.remove();
                    })
                    .catch((error) => {
                        console.error(error);
                        alert("An error occurred while deleting the notification.");
                    });
            }
        });

        notificationContainer.appendChild(newAccordion);
    }

    // Cập nhật thông báo trong UI
    function updateNotificationUI(id, title, content) {
        const accordion = document.querySelector(`.accordion-content[data-id='${id}']`);
        if (accordion) {
            accordion.querySelector(".title").textContent = title;
            accordion.querySelector(".description").textContent = content;
        }
    }
})();
