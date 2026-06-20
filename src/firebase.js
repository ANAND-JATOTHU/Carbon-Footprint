import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUIvxMZdNBnnbVMYkj3ZTt7P8X_ZxLu08",
  authDomain: "carbon-zero-500016-8c8e4.firebaseapp.com",
  projectId: "carbon-zero-500016-8c8e4",
  storageBucket: "carbon-zero-500016-8c8e4.firebasestorage.app",
  messagingSenderId: "1990934240",
  appId: "1:1990934240:web:4fa762946c50ec6eb71a85",
  measurementId: "G-E4WE81JHS5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
