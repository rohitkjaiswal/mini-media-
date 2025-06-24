import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";

const postsRef = collection(db, "posts");

export const addPost = async(postData) => {
    await addDoc(postsRef, postData);
};

export const getAllPosts = async() => {
    const snapshot = await getDocs(postsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deletePost = async(id) => {
    await deleteDoc(doc(db, "posts", id));
};

export const updatePost = async(id, updates) => {
    await updateDoc(doc(db, "posts", id), updates);
};

export const saveLoggedInUser = (user) => {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
};

export const getLoggedInUser = () => {
    const data = localStorage.getItem("loggedInUser");
    return data ? JSON.parse(data) : null;
};

export const clearLoggedInUser = () => {
    localStorage.removeItem("loggedInUser");
};

export const savePost = (post) => {
    const existingPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const updatedPosts = [post, ...existingPosts];
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
};