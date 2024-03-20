import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBzwbYbs-bxIkULAk_30gryuvy2QLiFhhQ",
    authDomain: "online-store-5bfad.firebaseapp.com",
    projectId: "online-store-5bfad",
    storageBucket: "online-store-5bfad.appspot.com",
    messagingSenderId: "126635387691",
    appId: "1:126635387691:web:a2b74b504b3e7fc04c736e",
    measurementId: "G-DWYT7C9DFM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submitData = document.getElementById("submit");
const forgotEmail = document.getElementById("email");

submitData.addEventListener("click", () => {
    const email = forgotEmail.value;
    sendPasswordResetEmail(auth, email)
        .then(() => {
            forgotEmail.value = "";
            Swal.fire("Congratulation!", "Your Password reset link has been sent to your email!", "success");
            // Redirect to login page after 4 seconds
            setTimeout(() => {
                window.location.href = "login.html";
            }, 4000);
        })
        .catch((error) => {
            console.error("Error sending password reset email:", error);
            const errorMessage = error.message;
            Swal.fire("Oops!", errorMessage, "error");
        });
});
