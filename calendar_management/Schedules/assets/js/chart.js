(function () {
    let currentDate = new Date();

    // Hàm tính ngày Thứ Hai của tuần hiện tại
    function getStartDate(date) {
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = (day === 0 ? -6 : 1) - day; // Điều chỉnh Chủ Nhật thành Thứ Hai
        monday.setDate(monday.getDate() + diff);
        monday.setMinutes(monday.getMinutes() - monday.getTimezoneOffset());
        return monday.toISOString().split('T')[0]; // Trả về định dạng yyyy-mm-dd
    }

    // Hàm tăng chiều cao cột (hiệu ứng hoạt hình)
    function tangChieuCaoCot(selector, chieuCaoMucTieu, buocTang = 0.05, thoiGianLap = 5) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            let chieuCao = 0; // Chiều cao ban đầu
            element.style.overflow = 'hidden'; // Đảm bảo hiển thị thay đổi chiều cao
            const tangChieuCao = setInterval(() => {
                chieuCao += buocTang;
                element.style.height = chieuCao * 20 + "px";
                if (chieuCao >= chieuCaoMucTieu) {
                    clearInterval(tangChieuCao); // Dừng khi đạt chiều cao mục tiêu
                }
            }, thoiGianLap);

            // Tạo tooltip khi di chuột vào cột
            element.addEventListener('mouseover', (event) => {
                let tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = `Quantity: ${chieuCaoMucTieu}`; // Nội dung tooltip
                document.body.appendChild(tooltip);

                // Định vị tooltip
                tooltip.style.position = 'absolute';
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
                tooltip.style.padding = '5px 10px';
                tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                tooltip.style.color = '#fff';
                tooltip.style.borderRadius = '5px';
                tooltip.style.fontSize = '12px';

                // Xóa tooltip khi di chuột ra ngoài
                element.addEventListener('mouseout', () => {
                    tooltip.remove();
                });
            });
        });
    }

    // Hàm cập nhật số lượng công việc đã hoàn thành và chưa hoàn thành
    function updateWorkCounts() {
        // Lấy userId từ localStorage
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            window.location.href = 'http://127.0.0.1:5500/index.html'; // Chuyển hướng nếu chưa đăng nhập
            return;
        }
        const user = JSON.parse(loggedInUser);
        const userId = user.userId; // Lấy userId từ thông tin người dùng

        // Lấy ngày Thứ Hai của tuần hiện tại
        const startDate = getStartDate(currentDate);
        const monday = new Date(startDate);

        // Gọi API cho mỗi ngày từ Thứ Hai đến Chủ Nhật
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + i);
            const currentDateStr = currentDay.toISOString().split('T')[0]; // Định dạng yyyy-mm-dd

            // Gọi API /count/day/{userId}/{date}
            fetch(`http://localhost:8080/api/schedule/count/day/${userId}/${currentDateStr}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(`Response from count API for ${currentDateStr}:`, data); // In ra phản hồi từ API để kiểm tra
                    if (data && typeof data.count !== 'undefined') {
                        const count = data.count;
                        tangChieuCaoCot(`.chart-${i + 1}`, count); // Cập nhật chiều cao cho cột tương ứng với ngày
                    } else {
                        alert('API không trả về dữ liệu hợp lệ');
                    }
                })
                .catch(error => {
                    console.error(`Error fetching count for day ${currentDateStr}:`, error);
                    alert("Lỗi khi tải số lượng công việc cho ngày " + currentDateStr);
                });
        }
    }

    // Hàm cập nhật số lượng tổng công việc (hoàn thành + chưa hoàn thành)
    function updateTotalCount() {
        // Lấy userId từ localStorage
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            return;
        }
        const user = JSON.parse(loggedInUser);
        const userId = user.userId; // Lấy userId từ thông tin người dùng

        let totalCount = 0;

        // Fetch công việc đã hoàn thành
        fetch(`http://localhost:8080/api/schedule/completed/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Completed count API response:", data);
                if (data && typeof data.count !== 'undefined') {
                    const completedCount = data.count;
                    document.getElementById('number-completed').textContent = completedCount;
                    totalCount += completedCount;
                    updateTotalDisplay(totalCount);
                } else {
                    alert('API không trả về dữ liệu hợp lệ (completed)');
                }
            })
            .catch(error => {
                console.error("Error fetching completed count:", error);
                alert("Lỗi khi tải số lượng công việc hoàn thành.");
            });

        // Fetch công việc chưa hoàn thành
        fetch(`http://localhost:8080/api/schedule/unfinished/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Unfinished count API response:", data);
                if (data && typeof data.count !== 'undefined') {
                    const unfinishedCount = data.count;
                    document.getElementById('number-unfinished').textContent = unfinishedCount;
                    totalCount += unfinishedCount;
                    updateTotalDisplay(totalCount);
                } else {
                    alert('API không trả về dữ liệu hợp lệ (unfinished)');
                }
            })
            .catch(error => {
                console.error("Error fetching unfinished count:", error);
                alert("Lỗi khi tải số lượng công việc chưa hoàn thành.");
            });
    }

    // Hàm cập nhật tổng số công việc
    function updateTotalDisplay(total) {
        document.getElementById('number-total').textContent = total;
    }

    // Gọi hàm khi trang load
    updateWorkCounts();
    updateTotalCount();
})();
