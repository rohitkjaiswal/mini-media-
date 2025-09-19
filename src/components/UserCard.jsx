import React, { useEffect, useState } from "react";
import { followUser, unfollowUser } from "../utils/follow";
import { getLoggedInUser } from "../utils/storage"; // Or from context/auth
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const UserCard = ({ user }) => {
  const currentUser = getLoggedInUser(); // logged in user info
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      const currentDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (currentDoc.exists()) {
        const data = currentDoc.data();
        setIsFollowing(data.following?.includes(user.uid));
      }
    };
    checkFollowingStatus();
  }, [currentUser.uid, user.uid]);

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowUser(currentUser.uid, user.uid);
      setIsFollowing(false);
    } else {
      await followUser(currentUser.uid, user.uid);
      setIsFollowing(true);
    }
  };

  return (
    <div className="card p-3 mb-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-1">{user.displayName}</h5>
          <p className="text-muted mb-0">@{user.username}</p>
        </div>
        <button
          className={`btn btn-sm ${isFollowing ? "btn-danger" : "btn-primary"}`}
          onClick={handleFollowToggle}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
