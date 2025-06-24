import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";

// 🔁 Follow a user
export const followUser = async(currentUid, targetUid) => {
    try {
        // Add target to my following
        await updateDoc(doc(db, "users", currentUid), {
            following: arrayUnion(targetUid),
        });

        // Add me to target's followers
        await updateDoc(doc(db, "users", targetUid), {
            followers: arrayUnion(currentUid),
        });
    } catch (err) {
        console.error("Error following user:", err);
        throw err;
    }
};

// 🔁 Unfollow a user
export const unfollowUser = async(currentUid, targetUid) => {
    try {
        // Remove target from my following
        await updateDoc(doc(db, "users", currentUid), {
            following: arrayRemove(targetUid),
        });

        // Remove me from target's followers
        await updateDoc(doc(db, "users", targetUid), {
            followers: arrayRemove(currentUid),
        });
    } catch (err) {
        console.error("Error unfollowing user:", err);
        throw err;
    }
};