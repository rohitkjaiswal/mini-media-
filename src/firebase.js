// firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3ezh5nqFK72sZom4k2501cbSX92GpQaQ",
    authDomain: "mini-media-85741.firebaseapp.com",
    projectId: "mini-media-85741",
    storageBucket: "mini-media-85741.appspot.com",
    messagingSenderId: "12489844177",
    appId: "1:12489844177:web:cd6e81c65cf9d9eae3ecf0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore & Auth
export const db = getFirestore(app);
export const auth = getAuth(app);