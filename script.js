// ==================================
// SOILCARE WEBSITE
// ==================================

// Storage functions

function getData(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("soilcareUser") || "null");
}


// ==================================
// FARMER REGISTRATION
// ==================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const phone = document.getElementById("phone").value;
        const address = document.getElementById("address").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            alert("Enter a valid 10-digit mobile number.");
            return;
        }

        let users = getData("soilcareUsers");

        if (users.some(user => user.email === email)) {
            alert("Email already registered!");
            return;
        }

        users.push({
            name,
            email,
            phone,
            address,
            password
        });

        saveData("soilcareUsers", users);

        alert("Registration successful! Please login.");

        window.location.href = "login.html";

    });

}


// ==================================
// FARMER LOGIN
// ==================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const users = getData("soilcareUsers");

        const user = users.find(
            u => u.email === email && u.password === password
        );

        if (!user) {
            alert("Invalid email or password!");
            return;
        }

        localStorage.setItem("soilcareUser", JSON.stringify(user));

        alert("Login successful!");

        window.location.href = "dashboard.html";

    });

}


// ==================================
// LOGIN PROTECTION
// ==================================

const protectedPages = [
    "dashboard.html",
    "appointment.html",
    "reports.html"
];

const currentPage = window.location.pathname.split("/").pop();

if (protectedPages.includes(currentPage) && !getCurrentUser()) {
    window.location.href = "login.html";
}


// ==================================
// LOGOUT
// ==================================

function logout() {

    localStorage.removeItem("soilcareUser");

    alert("Logged out successfully!");

    window.location.href = "login.html";

}


// ==================================
// FARMER DASHBOARD
// ==================================

if (currentPage === "dashboard.html" && getCurrentUser()) {

    const user = getCurrentUser();

    document.getElementById("farmerName").textContent = user.name;

    const appointments = getData("soilcareAppointments")
        .filter(a => a.email === user.email);

    const reports = getData("soilcareReports")
        .filter(r => r.email === user.email);

    document.getElementById("totalAppointments").textContent =
        appointments.length;

    document.getElementById("pendingAppointments").textContent =
        appointments.filter(a => a.status === "Pending").length;

    document.getElementById("completedAppointments").textContent =
        appointments.filter(a => a.status === "Completed").length;

    document.getElementById("totalReports").textContent =
        reports.length;

}


// ==================================
// APPOINTMENT BOOKING
// ==================================

const appointmentForm = document.getElementById("appointmentForm");

if (appointmentForm) {

    const user = getCurrentUser();

    document.getElementById("farmer").value = user.name;
    document.getElementById("mobile").value = user.phone;

    const dateInput = document.getElementById("date");

    const today = new Date();
    const localToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    dateInput.min = localToday;

    appointmentForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const appointmentDate = dateInput.value;

        if (appointmentDate < localToday) {
            alert("Please select a future date.");
            return;
        }

        let appointments = getData("soilcareAppointments");

        const appointment = {

            id: "SC" + Date.now(),

            email: user.email,

            farmer: document.getElementById("farmer").value,

            mobile: document.getElementById("mobile").value,

            village: document.getElementById("village").value,

            land: document.getElementById("land").value,

            soilType: document.getElementById("soilType").value,

            crop: document.getElementById("crop").value,

            date: appointmentDate,

            description: document.getElementById("description").value,

            status: "Pending"

        };

        appointments.push(appointment);

        saveData("soilcareAppointments", appointments);

        alert("Appointment booked successfully! Your ID is " + appointment.id);

        window.location.href = "dashboard.html";

    });

}


// ==================================
// VIEW SOIL REPORTS
// ==================================

if (currentPage === "reports.html" && getCurrentUser()) {

    const user = getCurrentUser();

    const reports = getData("soilcareReports")
        .filter(r => r.email === user.email);

    const table = document.getElementById("reportTable");

    if (reports.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">No reports available yet.</td>
            </tr>
        `;

    } else {

        reports.forEach(report => {

            const row = document.createElement("tr");

            const id = document.createElement("td");
            id.textContent = report.id;

            const farmer = document.createElement("td");
            farmer.textContent = report.farmer;

            const date = document.createElement("td");
            date.textContent = report.date;

            const action = document.createElement("td");

            const link = document.createElement("a");
            link.href = report.file;
            link.download = report.fileName;
            link.textContent = "Download Report";

            action.appendChild(link);

            row.append(id, farmer, date, action);

            table.appendChild(row);

        });

    }

}


// ==================================
// ADMIN LOGIN
// ==================================

const adminPassword = "Admin@123";

if (currentPage === "admin.html") {

    const loggedIn = sessionStorage.getItem("soilcareAdmin");

    if (!loggedIn) {

        const password = prompt("Enter Admin Password:");

        if (password === adminPassword) {

            sessionStorage.setItem("soilcareAdmin", "true");

        } else {

            alert("Incorrect admin password!");

            window.location.href = "index.html";

        }

    }

}


// ==================================
// ADMIN LOGOUT
// ==================================

function adminLogout() {

    sessionStorage.removeItem("soilcareAdmin");

    window.location.href = "index.html";

}


// ==================================
// ADMIN APPOINTMENT MANAGEMENT
// ==================================

if (currentPage === "admin.html" &&
    sessionStorage.getItem("soilcareAdmin") === "true") {

    displayAppointments();

}


function displayAppointments() {

    const appointments = getData("soilcareAppointments");

    const table = document.getElementById("appointmentTable");

    if (!table) return;

    table.innerHTML = "";

    if (appointments.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8">No appointments found.</td>
            </tr>
        `;

        return;

    }

    appointments.forEach(a => {

        const row = document.createElement("tr");

        const values = [
            a.id,
            a.farmer,
            a.mobile,
            a.village,
            a.soilType,
            a.crop,
            a.date,
            a.status
        ];

        values.forEach(value => {

            const td = document.createElement("td");

            td.textContent = value;

            row.appendChild(td);

        });

        const action = document.createElement("td");

        const select = document.createElement("select");

        ["Pending", "Approved", "Completed", "Rejected"].forEach(status => {

            const option = document.createElement("option");

            option.value = status;
            option.textContent = status;
            option.selected = a.status === status;

            select.appendChild(option);

        });

        select.addEventListener("change", function() {

            let all = getData("soilcareAppointments");

            const item = all.find(x => x.id === a.id);

            item.status = select.value;

            saveData("soilcareAppointments", all);

            displayAppointments();

        });

        action.appendChild(select);

        row.appendChild(action);

        table.appendChild(row);

    });

}


// ==================================
// ADMIN REPORT UPLOAD
// ==================================

const uploadForm = document.getElementById("uploadForm");

if (uploadForm) {

    uploadForm.addEventListener("submit", function(e) {

        e.preventDefault();

        if (sessionStorage.getItem("soilcareAdmin") !== "true") {
            alert("Admin access required.");
            return;
        }

        const appointmentId =
            document.getElementById("reportAppointment").value.trim();

        const file =
            document.getElementById("reportFile").files[0];

        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Only PDF, JPG and PNG files are allowed.");
            return;
        }

        if (file.size > 1024 * 1024) {
            alert("For this demo, please upload a file smaller than 1 MB.");
            return;
        }

        let appointments = getData("soilcareAppointments");

        const appointment = appointments.find(
            a => a.id === appointmentId
        );

        if (!appointment) {
            alert("Appointment ID not found!");
            return;
        }

        const reader = new FileReader();

        reader.onload = function() {

            let reports = getData("soilcareReports");

            reports.push({

                id: "RPT" + Date.now(),

                appointmentId: appointment.id,

                email: appointment.email,

                farmer: appointment.farmer,

                date: new Date().toLocaleDateString(),

                fileName: file.name,

                file: reader.result

            });

            saveData("soilcareReports", reports);

            appointment.status = "Completed";

            saveData("soilcareAppointments", appointments);

            alert("Soil report uploaded successfully!");

            uploadForm.reset();

        };

        reader.onerror = function() {
            alert("Unable to read the file.");
        };

        reader.readAsDataURL(file);

    });

}