import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase"; // Adjust path as needed

const PostCard = ({ post, onDelete, onComment, onEdit }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [authorData, setAuthorData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "posts", post.id), (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setLikeCount(data.likes || 0);
        setLiked(data.likedBy?.includes(currentUser?.uid));
      }
    });

    if (post.authorId) {
      const authorRef = doc(db, "users", post.authorId);
      const unsubFollow = onSnapshot(authorRef, (snap) => {
        const data = snap.data();
        setAuthorData(data);
        setIsFollowing(data.followers?.includes(currentUser?.uid));
      });

      return () => {
        unsubscribe();
        unsubFollow();
      };
    }

    return () => unsubscribe();
  }, [post.id, post.authorId, currentUser]);

  const toggleLike = async () => {
    const postRef = doc(db, "posts", post.id);
    if (!currentUser) return alert("Login required");

    await updateDoc(postRef, {
      likes: liked ? likeCount - 1 : likeCount + 1,
      likedBy: liked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
    });
  };

  const toggleFollow = async () => {
    if (!currentUser || currentUser.uid === post.authorId) return;

    const userRef = doc(db, "users", currentUser.uid);
    const authorRef = doc(db, "users", post.authorId);

    await updateDoc(authorRef, {
      followers: isFollowing ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
    });

    await updateDoc(userRef, {
      following: isFollowing ? arrayRemove(post.authorId) : arrayUnion(post.authorId),
    });
  };

  const handleEdit = () => {
    if (onEdit) onEdit(post);
    else alert("Edit feature coming soon!");
  };

  const handleProfileClick = () => {
    navigate(`/profile/${post.authorId || "anonymous"}`);
  };

  return (
    <div className="post-card shadow-sm" style={styles.card}>
      {/* Header */}
      <div className="d-flex align-items-center p-3 border-bottom">
        {post.profilePic ? (
          <img
            src={post.profilePic}
            alt="User"
            className="rounded-circle me-2"
            style={styles.avatar}
            onClick={handleProfileClick}
          />
        ) : (
          <div onClick={handleProfileClick} className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2" style={styles.avatar}>
            {post.author?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div>
          <span onClick={handleProfileClick} className="fw-bold text-primary" style={{ cursor: "pointer" }}>
            {post.author || "Anonymous"}
          </span>
          <br />
          <small className="text-muted">{post.date}</small>
        </div>
        {/* Follow Button */}
        {post.authorId !== currentUser?.uid && (
          <button className="btn btn-sm btn-outline-primary ms-auto" onClick={toggleFollow}>
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {/* Image */}
      {post.image && <img src={post.image} alt="Post" style={styles.image} />}

      {/* Content */}
      <div style={styles.content}>
        <p style={styles.caption}>{post.caption}</p>

        {/* Likes/Comments */}
        <div style={styles.meta}>
          <small className="text-muted me-3">❤️ {likeCount} Likes</small>
          <small className="text-muted">💬 {post.comments?.length || 0} Comments</small>
        </div>

        {/* Action Buttons */}
        <div style={styles.footer}>
          <div>
            <button onClick={toggleLike} style={{ ...styles.iconBtn, backgroundColor: liked ? "#ff6b81" : "#eee" }}>
              ❤️ {liked ? "Liked" : "Like"}
            </button>
            <button style={styles.iconBtn} onClick={() => (onComment ? onComment(post.id) : alert("Comment feature coming soon!"))}>
              💬 Comment
            </button>
            {post.authorId === currentUser?.uid && (
              <button onClick={handleEdit} style={styles.iconBtn}>
                ✏️ Edit
              </button>
            )}
          </div>
          {onDelete && (
            <button onClick={() => onDelete(post.id)} style={styles.deleteBtn} title="Delete Post">
              🗑
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    borderRadius: "14px",
    marginBottom: "24px",
    overflow: "hidden",
    backgroundColor: "#fff",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
  },
  avatar: {
    width: "40px",
    height: "40px",
    objectFit: "cover",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
  },
  content: {
    padding: "16px",
  },
  caption: {
    marginBottom: "8px",
    fontSize: "1rem",
    fontWeight: "500",
  },
  meta: {
    marginBottom: "12px",
    fontSize: "0.85rem",
    color: "#888",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: {
    border: "none",
    backgroundColor: "#f0f0f0",
    marginRight: "10px",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  deleteBtn: {
    border: "none",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
};

export default PostCard;
