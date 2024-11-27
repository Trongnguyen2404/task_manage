(function () {
    // DOM elements
    const weekDaysContainer = document.getElementById("week-days");
    const prevWeekBtn = document.getElementById("prev-week");
    const nextWeekBtn = document.getElementById("next-week");
    const eventModal = document.getElementById("event-modal");
    const closeModalBtn = document.getElementById("close-btn");
    const addEventBtn = document.getElementById("add-event-btn");
    const eventTitleInput = document.getElementById("event-title");
    const eventTimeFromInput = document.getElementById("event-time-from");
    const eventTimeToInput = document.getElementById("event-time-to");
    const eventStartDateInput = document.getElementById("event-start-date");
    const eventEndDateInput = document.getElementById("event-end-date");
    const eventLocationInput = document.getElementById("event-location");
    const eventOrganizationInput = document.getElementById("event-organization");
    const createSingleEventBtn = document.getElementById("create-single-event");
    const createMultipleEventsBtn = document.getElementById("create-multiple-events");

    // New elements for editing and deleting events
    let editMode = false;
    let currentEvent = null; // To keep track of the event being edited or viewed

    let currentDate = new Date();
    let selectedDate = null;
    let eventsArr = [];
    let mode = "";

    // Close modal when clicking outside of it
    window.addEventListener("click", function (event) {
        if (event.target === eventModal) {
            closeModal();
        }
    });

    // Get the Monday of the week
    function getMonday(date) {
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = (day === 0 ? -6 : 1) - day; // Adjust Sunday to Monday
        monday.setDate(monday.getDate() + diff);
        monday.setMinutes(monday.getMinutes() - monday.getTimezoneOffset());
        return monday;
    }
    // Render the week
    function renderWeek(date) {
        const monday = getMonday(date);

        // Lấy userId từ localStorage
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            window.location.href = 'http://127.0.0.1:5500/index.html'; // Chuyển hướng nếu chưa đăng nhập
            return;
        }

        const user = JSON.parse(loggedInUser);
        const userId = user.userId;

        // Cập nhật ngày trong <thead>
        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);

            const dateLabel = document.getElementById(`date-${i}`);
            if (dateLabel) {
                dateLabel.textContent = `${day.getDate()}/${day.getMonth() + 1}`;
            }
        }

        // Xóa các sự kiện cũ
        weekDaysContainer.innerHTML = "";

        // Số dòng tối thiểu mỗi cột
        const minRows = 10;

        // Gửi yêu cầu fetch đến API với userId và startDate (Ngày đầu tuần)
        fetch(`http://localhost:8080/api/schedule/week/${userId}/${monday.toISOString().split('T')[0]}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched events:", data); // Debugging
                eventsArr = data; // Cập nhật mảng sự kiện với dữ liệu từ API

                for (let rowIndex = 0; rowIndex < minRows; rowIndex++) {
                    const row = document.createElement("tr");

                    for (let i = 0; i < 7; i++) {
                        const dayCell = document.createElement("td");
                        dayCell.classList.add("calendar-cell");

                        const day = new Date(monday);
                        day.setDate(monday.getDate() + i);

                        // Lọc và sắp xếp các sự kiện theo giờ cho ngày hiện tại
                        const dayEvents = eventsArr
                            .filter(event => isSameDay(event.dayStart, day))
                            .sort((a, b) => {
                                const timeA = a.timeStart.split(":").map(Number);
                                const timeB = b.timeStart.split(":").map(Number);
                                return timeA[0] - timeB[0] || timeA[1] - timeB[1];
                            });

                        if (rowIndex < dayEvents.length) {
                            const event = dayEvents[rowIndex];
                            const eventDiv = document.createElement("div");
                            eventDiv.classList.add("event");
                            eventDiv.innerHTML = `
                            <div>${event.eventName}</div>
                            <div class="time">${event.timeStart} - ${event.timeEnd}</div>
                        `;

                            // Tạo nút "Đã hoàn thành"
                            const completeEventBtn = document.createElement("button");
                            completeEventBtn.classList.add("btn-success", "event-action-btn");
                            completeEventBtn.innerHTML = `<i class="fa-solid fa-check"></i>`; // Biểu tượng check
                            completeEventBtn.title = "Confirmation completed";

                            // Thêm sự kiện click vào nút "Đã hoàn thành"
                            completeEventBtn.addEventListener("click", (e) => {
                                e.stopPropagation(); // Ngăn việc kích hoạt sự kiện click của eventDiv

                                // Gửi yêu cầu PUT đến API để cập nhật trạng thái sự kiện
                                fetch(`http://localhost:8080/api/schedule/complete/${event.id}`, {
                                    method: 'PUT', // Hoặc 'PATCH' tùy vào API của bạn
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Nếu cần token xác thực
                                    },
                                    body: JSON.stringify({
                                        status: 'complete' // Cập nhật trạng thái sự kiện thành "hoàn thành"
                                    })
                                })
                                    .then(response => response.json())
                                    .then(updatedEvent => {
                                        alert(`Event "${updatedEvent.eventName}" has been marked as complete!`);
                                        updateWorkCounts(currentDate);

                                        // Cập nhật lại trạng thái của sự kiện trong giao diện
                                        event.status = 'complete'; // Cập nhật trạng thái sự kiện trong dữ liệu
                                        dayCell.style.borderBottom = '4px solid #008932'; // Cập nhật giao diện cho sự kiện đã hoàn thành
                                    })
                                    .catch(error => {
                                        console.error("Lỗi khi cập nhật sự kiện:", error);
                                        alert("Có lỗi xảy ra khi cập nhật sự kiện. Vui lòng thử lại.");
                                    });
                            });

                            // Tạo container để chứa các nút hành động
                            const actionContainer = document.createElement("div");
                            actionContainer.classList.add("event-actions");
                            actionContainer.appendChild(completeEventBtn);

                            // Thêm container nút vào div sự kiện
                            eventDiv.appendChild(actionContainer);

                            // Thêm sự kiện click vào để xem chi tiết
                            eventDiv.addEventListener("click", (e) => {
                                e.stopPropagation(); // Ngừng sự kiện click của cell
                                currentEvent = event;
                                openEventDetailsModal(event);
                            });

                            dayCell.appendChild(eventDiv);

                            // Set border style based on event status
                            if (event.status === 'unfinished') {
                                dayCell.style.borderBottom = '4px solid red'; // Unfinished
                            } else if (event.status === 'complete') {
                                dayCell.style.borderBottom = '4px solid #008932'; // Complete
                            }
                        }

                        // Cho phép click vào bất kỳ cell nào để thêm sự kiện
                        dayCell.addEventListener("click", () => {
                            if (!editMode) {
                                selectedDate = day;
                                mode = "day";
                                openModal("Create a calendar for the day", false);
                            }
                        });

                        row.appendChild(dayCell);
                    }

                    weekDaysContainer.appendChild(row);
                }
            })
            .catch(error => {
                console.error("Error fetching events:", error);
                alert("Lỗi khi tải lịch. Vui lòng thử lại sau.");
            });
    }


    // Check if two dates are the same day
    function isSameDay(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        console.log(`Comparing ${d1.toISOString()} with ${d2.toISOString()}`); // Debugging
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    // Open modal for creating or editing an event
    function openModal(title, isMultiple, isEditing = false) {
        document.getElementById("modal-title").textContent = title;

        // Show or hide fields based on mode
        eventStartDateInput.style.display = isMultiple ? "block" : (mode === "day" ? "none" : "block");
        eventEndDateInput.style.display = isMultiple ? "block" : "none";

        // Reset modal fields if not editing
        if (!isEditing) {
            eventTitleInput.value = "";
            eventTimeFromInput.value = "";
            eventTimeToInput.value = "";
            eventStartDateInput.value = "";
            eventEndDateInput.value = "";
            eventLocationInput.value = "";
            eventOrganizationInput.value = "";
        }

        // Set default start date if day mode
        if (mode === "day" && selectedDate) {
            const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
            eventStartDateInput.value = dateStr;
        }

        disableInputs(false); // Enable all inputs for new event creation
        eventModal.style.display = "flex";
    }

    // Open modal to display event details
    function openEventDetailsModal(event) {
        editMode = false;
        // Populate modal with event details
        eventTitleInput.value = event.eventName;
        eventTimeFromInput.value = event.timeStart;
        eventTimeToInput.value = event.timeEnd;
        eventStartDateInput.value = formatDate(event.dayStart);
        eventEndDateInput.value = formatDate(event.dayStart);
        eventLocationInput.value = event.location || "";
        eventOrganizationInput.value = event.content || "";

        // Disable inputs
        disableInputs(true);

        // Change modal title
        document.getElementById("modal-title").textContent = "Event information";

        // Adjust buttons
        addEventBtn.style.display = "none";
        editEventBtn.style.display = "inline-block";
        deleteEventBtn.style.display = "inline-block";

        eventModal.style.display = "flex";
    }

    // Disable or enable inputs
    function disableInputs(disable) {
        eventTitleInput.disabled = disable;
        eventTimeFromInput.disabled = disable;
        eventTimeToInput.disabled = disable;
        eventStartDateInput.disabled = disable;
        eventEndDateInput.disabled = disable;
        eventLocationInput.disabled = disable;
        eventOrganizationInput.disabled = disable;
    }

    // Validate time
    function isValidTime(timeFrom, timeTo) {
        const [fromHour, fromMinute] = timeFrom.split(":").map(Number);
        const [toHour, toMinute] = timeTo.split(":").map(Number);
        return (fromHour < toHour || (fromHour === toHour && fromMinute < toMinute));
    }

    /// Add event
    function addEvent(isMultiple) {
        const title = eventTitleInput.value.trim();
        const timeFrom = eventTimeFromInput.value.trim();
        const timeTo = eventTimeToInput.value.trim();
        const startDate = new Date(eventStartDateInput.value);
        const endDate = isMultiple ? new Date(eventEndDateInput.value) : startDate;

        // Lấy ngày hiện tại
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Chỉ so sánh ngày, bỏ qua giờ phút

        // Kiểm tra ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại
        if (startDate < currentDate) {
            alert("The start date must be greater than or equal to the current date.");
            return;
        }

        // Kiểm tra ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu
        if (endDate < startDate) {
            alert("The end date must be greater than or equal to the start date.");
            return;
        }

        // Kiểm tra tính hợp lệ của thời gian
        if (!isValidTime(timeFrom, timeTo)) {
            alert("The start time must be before the end time.");
            return;
        }

        // Lấy thông tin người dùng đã đăng nhập
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        const newSchedules = []; // Mảng chứa tất cả lịch cần tạo

        // Tạo lịch cho từng ngày trong khoảng thời gian
        let currentDay = new Date(startDate); // Bắt đầu từ ngày bắt đầu
        while (currentDay <= endDate) {
            newSchedules.push({
                userId: loggedInUser.userId,
                eventName: title,
                timeStart: timeFrom,
                timeEnd: timeTo,
                dayStart: currentDay.toISOString().split('T')[0], // Định dạng ngày (YYYY-MM-DD)
                dayEnd: currentDay.toISOString().split('T')[0], // Định dạng ngày (YYYY-MM-DD)
                location: eventLocationInput.value.trim(),
                content: eventOrganizationInput.value.trim(),
                groupId: loggedInUser.groupId // Assuming you have groupId in your user data
            });

            // Tiến đến ngày kế tiếp
            currentDay.setDate(currentDay.getDate() + 1);
        }

        // Gửi tất cả các lịch tạo mới trong mảng newSchedules
        newSchedules.forEach(schedule => {
            fetch('http://localhost:8080/api/schedule/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(schedule),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Calendar created:", data);
                })
                .catch(error => {
                    console.error("Lỗi khi tạo lịch:", error);
                    alert("Lỗi khi tạo lịch. Vui lòng thử lại.");
                });
        });

        alert("Calendar has been created successfully!");
        renderWeek(currentDate);  // Cập nhật lại lịch sau khi tạo xong các sự kiện
        closeModal();
    }


    function updateEvent() {
        const title = eventTitleInput.value.trim();
        const timeFrom = eventTimeFromInput.value.trim();
        const timeTo = eventTimeToInput.value.trim();
        const startDate = new Date(eventStartDateInput.value);
        const endDate = new Date(eventEndDateInput.value);

        // Lấy ngày hiện tại
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Chỉ so sánh ngày, bỏ qua giờ phút

        // Kiểm tra ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại
        if (startDate < currentDate) {
            alert("The start date must be greater than or equal to the current date.");
            return;
        }

        // Kiểm tra ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu
        if (endDate < startDate) {
            alert("The end date must be greater than or equal to the start date.");
            return;
        }

        if (!title || !timeFrom || !timeTo || !startDate || !endDate) {
            alert("Please enter complete information.");
            return;
        }

        if (!isValidTime(timeFrom, timeTo)) {
            alert("The start time must be before the end time.");
            return;
        }

        const updatedSchedule = {
            userId: currentEvent.userId, // Assuming you have userId stored in event
            eventName: title,
            timeStart: timeFrom,
            timeEnd: timeTo,
            dayStart: startDate.toISOString().split('T')[0],
            dayEnd: endDate.toISOString().split('T')[0],
            location: eventLocationInput.value.trim(),
            content: eventOrganizationInput.value.trim(),
            groupId: currentEvent.groupId
        };

        fetch(`http://localhost:8080/api/schedule/update/${currentEvent.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedSchedule),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert("Calendar has been updated!");
                renderWeek(currentDate);
                closeModal();
            })
            .catch(error => {
                alert("Lỗi khi cập nhật lịch. Vui lòng thử lại.");
                console.error(error);
            });
    }



    // Delete event
    function deleteEvent() {
        fetch(`http://localhost:8080/api/schedule/delete/${currentEvent.id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert("Calendar has been deleted.");
                renderWeek(currentDate);
                closeModal();
            })
            .catch(error => {
                alert("Lỗi khi xóa lịch. Vui lòng thử lại.");
                console.error(error);
            });
    }

    function closeModal() {
        eventModal.style.display = "none";
        // Reset modal buttons
        addEventBtn.style.display = "inline-block";
        editEventBtn.style.display = "none";
        deleteEventBtn.style.display = "none";
        currentEvent = null;
        editMode = false;
        selectedDate = null; // Reset selected date
        mode = ""; // Reset mode
        disableInputs(false); // Re-enable all inputs for future use
    }

    // Format date to YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    // Event listeners for week navigation
    prevWeekBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() - 7);
        updateWorkCounts(currentDate);
        renderWeek(currentDate);
    });

    nextWeekBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() + 7);
        updateWorkCounts(currentDate);
        renderWeek(currentDate);
    });

    // Event listeners for modal
    closeModalBtn.addEventListener("click", closeModal);

    addEventBtn.addEventListener("click", () => {
        const isMultiple = mode === "multiple";
        addEvent(isMultiple);
    });

    createSingleEventBtn.addEventListener("click", () => {
        mode = "single";
        openModal("Create a single calendar", false);
    });

    createMultipleEventsBtn.addEventListener("click", () => {
        mode = "multiple";
        openModal("Create consecutive schedules", true);
    });

    // New buttons for editing and deleting events
    // Tạo nút "Cập nhật"
    const editEventBtn = document.createElement("button");
    editEventBtn.id = "edit-event-btn";
    editEventBtn.classList.add("btn-update");

    // Tạo phần tử icon và văn bản cho nút "Cập nhật"
    const iconup = document.createElement("i");
    iconup.classList.add("fa-solid", "fa-pen");  // Thêm lớp biểu tượng "bút" từ Font Awesome

    const text = document.createTextNode("Update"); // Tạo văn bản cho nút

    // Thêm biểu tượng và văn bản vào nút "Cập nhật"
    editEventBtn.appendChild(iconup);
    editEventBtn.appendChild(text);

    // Ẩn nút mặc định
    editEventBtn.style.display = "none";

    // Thêm sự kiện click vào nút "Cập nhật"
    editEventBtn.addEventListener("click", () => {
        if (!editMode) {
            // Chuyển sang chế độ chỉnh sửa
            editMode = true;
            disableInputs(false);
        } else {
            // Cập nhật sự kiện
            updateEvent();
        }
    });

    // Tạo nút "Xóa"
    const deleteEventBtn = document.createElement("button");
    deleteEventBtn.id = "delete-event-btn";
    deleteEventBtn.classList.add("btn-delete");

    // Tạo phần tử icon và văn bản cho nút "Xóa"
    const iconDelete = document.createElement("i");
    iconDelete.classList.add("fa-solid", "fa-trash");  // Thêm lớp biểu tượng "thùng rác" từ Font Awesome

    const deleteText = document.createTextNode("Delete"); // Tạo văn bản cho nút

    // Thêm biểu tượng và văn bản vào nút "Xóa"
    deleteEventBtn.appendChild(iconDelete);
    deleteEventBtn.appendChild(deleteText);

    // Ẩn nút mặc định
    deleteEventBtn.style.display = "none";

    // Thêm sự kiện click vào nút "Xóa"
    deleteEventBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this event?")) {
            deleteEvent();
        }
    });

    // Append the new buttons to the modal
    const modalContent = document.querySelector(".event-modal-content");
    modalContent.appendChild(editEventBtn);
    modalContent.appendChild(deleteEventBtn);


    // Initial render
    renderWeek(currentDate);
    function updateWorkCounts(currentDate) {
        // Lấy userId từ localStorage
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            alert("Please log in to see the number of jobs.");
            return;
        }
        const user = JSON.parse(loggedInUser);
        const userId = user.userId; // Lấy userId từ thông tin người dùng
        const monday = getMonday(currentDate); // Tính toán ngày thứ Hai của tuần hiện tại
        const startDate = monday.toISOString().split('T')[0]; // Chuyển đổi sang định dạng yyyy-mm-dd
    
        // Khởi tạo biến để lưu số lượng công việc
        let completedCount = 0;
        let unfinishedCount = 0;
    
        // Lấy số lượng công việc hoàn thành trong tuần
        fetch(`http://localhost:8080/api/schedule/completed/week/${userId}/${startDate}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Response from completed API:", data); // In ra phản hồi từ API để kiểm tra
                if (data && typeof data.count !== 'undefined') {
                    completedCount = data.count;
                    document.getElementById('completed-count').textContent = completedCount;
                    // Cập nhật tổng công việc sau khi có completedCount
                    updateTotalCount(completedCount, unfinishedCount);
                } else {
                    alert('API không trả về dữ liệu hợp lệ (completed)');
                }
            })
            .catch(error => {
                console.error("Error fetching completed events:", error);
                alert("Lỗi khi tải số lượng công việc đã hoàn thành.");
            });
    
        // Lấy số lượng công việc chưa hoàn thành trong tuần
        fetch(`http://localhost:8080/api/schedule/unfinished/week/${userId}/${startDate}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Response from unfinished API:", data); // In ra phản hồi từ API để kiểm tra
                if (data && typeof data.count !== 'undefined') {
                    unfinishedCount = data.count;
                    document.getElementById('unfinished-count').textContent = unfinishedCount;
                    // Cập nhật tổng công việc sau khi có unfinishedCount
                    updateTotalCount(completedCount, unfinishedCount);
                } else {
                    alert('API không trả về dữ liệu hợp lệ (unfinished)');
                }
            })
            .catch(error => {
                console.error("Error fetching unfinished events:", error);
                alert("Lỗi khi tải số lượng công việc chưa hoàn thành.");
            });
    }
    
    // Hàm cập nhật tổng số công việc
    function updateTotalCount(completed, unfinished) {
        const totalCount = completed + unfinished;
        document.getElementById('total-count').textContent = totalCount;
    }

// Gọi hàm khi trang load
updateWorkCounts(currentDate);

})();
