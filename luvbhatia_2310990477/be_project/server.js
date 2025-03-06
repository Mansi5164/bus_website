
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, "users.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static Files (Front-End)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "login")));

// Load Users from JSON File
const loadUsers = () => {
    try {
        if (fs.existsSync(USERS_FILE)) {
            return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
        }
        return [];
    } catch (error) {
        console.error("Error loading users:", error);
        return [];
    }
};

// Save Users to JSON File
const saveUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving users:", error);
    }
};

// ✅ Serve Signup & Login Pages
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "login", "signup.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login", "login.html"));
});

// ✅ Signup Route
app.post("/signup", (req, res) => {
    const { fName, lName, email, password } = req.body;
    let users = loadUsers();

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ success: false, message: "User already exists!" });
    }

    // Add new user
    users.push({ fName, lName, email, password });
    saveUsers(users);

    res.json({ success: true, message: "Signup successful!" });
});

// ✅ Login Route
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    let users = loadUsers();

    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({ success: true, message: "Login successful!" });
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
