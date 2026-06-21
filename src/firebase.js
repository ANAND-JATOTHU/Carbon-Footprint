import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBEqMGW6BQx-1j-G8XrOA4dZ-ejOQE774Y",
  authDomain: "carbon-2cd28.firebaseapp.com",
  projectId: "carbon-2cd28",
  storageBucket: "carbon-2cd28.firebasestorage.app",
  messagingSenderId: "320973208664",
  appId: "1:320973208664:web:c05d1ccb26dcc6cfb7de2d",
  measurementId: "G-2EGMMN13LE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
