// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzwbYbs-bxIkULAk_30gryuvy2QLiFhhQ",
    authDomain: "online-store-5bfad.firebaseapp.com",
    projectId: "online-store-5bfad",
    storageBucket: "online-store-5bfad.appspot.com",
    messagingSenderId: "126635387691",
    appId: "1:126635387691:web:a2b74b504b3e7fc04c736e",
    measurementId: "G-DWYT7C9DFM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

var fullName = document.getElementById("fullname");
var contact = document.getElementById("contact");
var email = document.getElementById("email");
var password = document.getElementById("password");
var copassword = document.getElementById("copassword");
var credit = 10000;

window.signup = function (e) {
    const nameRegex = /^[a-zA-Z]+$/; // Only alphabets
    const contactRegex = /^\d+$/; // Only numbers

    if (fullName.value == "" || contact.value == "" || email.value == "" || password.value == "") {
        alert("All fields are required");
        return;
    }
    if (!nameRegex.test(fullName.value)) {
        alert("Name can only contain alphabets");
        return;
    }
    if (!contactRegex.test(contact.value)) {
        alert("Contact number can only contain numbers");
        return;
    }
    if (password.value != copassword.value) {
        alert("Password Confirmation is Wrong");
        return;
    }

    e.preventDefault();
    var obj = {
        firstName: fullName.value,
        contact: contact.value,
        email: email.value,
        password: password.value,
    };

    // Check if the email matches the admin pattern
    const isAdmin = /sridharvsm10@gmail\.com|connranjith@gmail\.com/.test(obj.email);

    // Create the user using Firebase Authentication
    createUserWithEmailAndPassword(auth, obj.email, obj.password)
        .then(function (userCredential) {
            // User signed up successfully
            const user=userCredential.user;
            const uid=user.uid;
            const role = isAdmin ? "Admin" : "Customer";
            const userDocRef = doc(db, role, uid);
            const userData = {
                fullName: obj.firstName,
                contact: obj.contact,
                email: obj.email,
            };
            if (!isAdmin) {
                userData.credit = credit;
            }
            setDoc(userDocRef, userData)
            .then(() => {
                console.log("User data added to Firestore successfully!");
                // Redirect to login page
                window.location.replace('login.html');
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                alert("Error adding user data to Firestore");
            });
        })
        .catch(function (error) {
            console.error("Error creating user: ", error);
            alert("Error creating user: " + error.message);
        });
};
