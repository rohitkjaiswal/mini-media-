import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { followUser, unfollowUser } from "../utils/userActions";

const FollowButton = ({ targetUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const checkFollowStatus = async () => {
      const currentUserRef = doc(db, "users", currentUserId);
      const currentUserSnap = await getDoc(currentUserRef);

      if (currentUserSnap.exists()) {
        const following = currentUserSnap.data().following || [];
        setIsFollowing(following.includes(targetUserId));
      }
    };

    if (currentUserId && targetUserId) checkFollowStatus();
  }, [currentUserId, targetUserId]);

  const handleClick = async () => {
    if (isFollowing) {
      await unfollowUser(currentUserId, targetUserId);
      setIsFollowing(false);
    } else {
      await followUser(currentUserId, targetUserId);
      setIsFollowing(true);
    }
  };

  if (currentUserId === targetUserId) return null;

  return (
    <button className={`btn ${isFollowing ? "btn-danger" : "btn-primary"}`} onClick={handleClick}>
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;
