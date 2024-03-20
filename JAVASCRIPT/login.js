// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth();

var email = document.getElementById("email");
var password = document.getElementById("password");
window.login= function(e) {
  e.preventDefault();
  var obj = {
    email: email.value,
    password: password.value,
  };

  signInWithEmailAndPassword(auth, obj.email, obj.password)
    .then(function (success) {
      var aaaa =  (success.user.uid);
      localStorage.setItem("uid",aaaa)
      console.log(aaaa)
      if(obj.email=="sridharvsm10@gmail.com" || obj.email=="connranjith@gmail.com"){
        window.location.replace('admindashboard.html');
      }
      else{
        window.location.replace('customerdashboard.html');
      }
      
    })
    .catch(function (err) {
      alert("login error"+err);
    });

  console.log(obj);
}


