// firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
export const provider = new GoogleAuthProvider();

export const signInWithGoogle = async() => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: user.displayName || user.email.split("@")[0],
            email: user.email,
            photoURL: user.photoURL || "",
            followers: [],
            following: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });

        console.log("User Info:", user);
        return user;
        // You can save user info to localStorage or state here
    } catch (error) {
        console.error("Error during Google sign-in:", error);
    }
};