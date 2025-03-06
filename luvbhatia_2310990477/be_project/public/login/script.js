document.addEventListener("DOMContentLoaded", function () {
    const signInButton = document.getElementById("signInButton");
    const signUpButton = document.getElementById("signUpButton");
    const signUpContainer = document.getElementById("signup");
    const signInContainer = document.getElementById("signIn");
    const submitSignUp = document.getElementById("submitSignUp");
    const submitSignIn = document.getElementById("submitSignIn");

    // Switch to Sign-Up Form
    signUpButton.addEventListener("click", function () {
        signInContainer.style.display = "none";
        signUpContainer.style.display = "block";
    });

    // Switch to Sign-In Form
    signInButton.addEventListener("click", function () {
        signUpContainer.style.display = "none";
        signInContainer.style.display = "block";
    });

    // Handle Sign-Up Form Submission
    submitSignUp.addEventListener("click", async function (e) {
        e.preventDefault();
        const fName = document.getElementById("fName").value;
        const lName = document.getElementById("lName").value;
        const email = document.getElementById("rEmail").value;
        const password = document.getElementById("rPassword").value;

        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fName, lName, email, password })
        });

        const data = await response.json();
        alert(data.message);
    });

    // Handle Sign-In Form Submission
    submitSignIn.addEventListener("click", async function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        alert(data.message);

        if (data.success) {
            window.location.href = "/home";
        }
    });
});
