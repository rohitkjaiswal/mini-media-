import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setName(data.name);
          setProfilePic(data.profilePic);
          setFollowersCount(data.followers?.length || 0);
          setFollowingCount(data.following?.length || 0);

          const q = query(
            collection(db, "posts"),
            where("author", "==", data.name),
            orderBy("timestamp", "desc")
          );

          const querySnapshot = await getDocs(q);
          const posts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMyPosts(posts);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading profile data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        name: name.trim(),
        profilePic: profilePic.trim(),
      });

      if (newPassword) {
        try {
          await user.updatePassword(newPassword);
        } catch (err) {
          if (err.code === "auth/requires-recent-login") {
            alert("⚠️ Please re-login to change your password.");
            auth.signOut();
            navigate("/login");
            return;
          } else {
            console.error("Password update error:", err);
            alert("❌ Password update failed.");
            return;
          }
        }
      }

      // Update user's name in their posts
      const postsQuery = query(
        collection(db, "posts"),
        where("author", "==", userData.name)
      );
      const postSnapshots = await getDocs(postsQuery);
      const updatePromises = postSnapshots.docs.map((docSnap) =>
        updateDoc(doc(db, "posts", docSnap.id), { author: name.trim() })
      );
      await Promise.all(updatePromises);

      alert("✅ Profile updated successfully!");
      setIsEditing(false);
      setUserData((prev) => ({ ...prev, name, profilePic }));
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("❌ Error updating profile. Try again.");
    }
  };

  if (loading) {
    return <p className="text-center mt-5">⏳ Loading profile...</p>;
  }

  return (
    <div className="container my-5">
      <h2 className="text-center text-primary mb-4">👤 Your Profile</h2>

      <div className="card p-4 shadow-sm border-0 rounded-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <img
            src={profilePic || "https://via.placeholder.com/100"}
            alt="Profile"
            className="rounded-circle border"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/100";
            }}
          />
          <div>
            {isEditing ? (
              <>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Profile Picture URL"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="New Password (optional)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </>
            ) : (
              <>
                <h4>{userData?.name}</h4>
                <p className="text-muted mb-0">{user?.email}</p>
                <div className="d-flex gap-4 mt-2">
                  <span>
                    <strong>{followersCount}</strong> Followers
                  </span>
                  <span>
                    <strong>{followingCount}</strong> Following
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 d-flex justify-content-between">
          {isEditing ? (
            <>
              <button className="btn btn-success" onClick={handleUpdate}>
                💾 Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                ❌ Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-warning"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          )}
        </div>
      </div>

      <h4 className="mb-3 text-secondary">📝 Your Posts</h4>
      <div className="row g-3">
        {myPosts.length === 0 ? (
          <p className="text-muted">You haven't posted anything yet.</p>
        ) : (
          myPosts.map((post) => (
            <div key={post.id} className="col-sm-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="card-img-top"
                    style={{ maxHeight: "250px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/250x200?text=No+Image";
                    }}
                  />
                )}
                <div className="card-body">
                  <p>{post.caption}</p>
                  <small className="text-muted">{post.date}</small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;
