import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const UserProfile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Step 1: Find user with matching username
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("name", "==", username));
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
          setUserData(null);
          setLoading(false);
          return;
        }

        const userDoc = userSnapshot.docs[0];
        const userInfo = userDoc.data();
        setUserData(userInfo);

        // Step 2: Fetch posts by this user
        const postsRef = collection(db, "posts");
        const postsQuery = query(postsRef, where("author", "==", username));
        const postsSnapshot = await getDocs(postsQuery);

        const posts = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserPosts(posts);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <p className="text-center mt-5">🔄 Loading profile...</p>;

  if (!userData) {
    return <p className="text-center mt-5">❌ User not found.</p>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="text-center mb-4">
        <img
          src={userData.profilePic || "/default-profile.png"}
          alt="Profile"
          className="rounded-circle mb-2"
          style={{ width: "100px", height: "100px", objectFit: "cover" }}
        />
        <h4>{userData.name}</h4>
        <p className="text-muted">@{username}</p>
      </div>

      <h5 className="mb-3">📸 Posts by {username}</h5>
      {userPosts.length > 0 ? (
        userPosts.map((post) => (
          <div key={post.id} className="card mb-3 shadow-sm">
            {post.image && <img src={post.image} alt="Post" className="card-img-top" />}
            <div className="card-body">
              <p className="card-text">{post.caption}</p>
              <p className="card-text text-muted">
                <small>{post.date}</small>
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">This user hasn't posted anything yet.</p>
      )}
    </div>
  );
};

export default UserProfile;
