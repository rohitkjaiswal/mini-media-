import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PostCard = ({ post, onDelete, onComment }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0); // new
  const navigate = useNavigate();

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1)); // update like count
  };

  const handleProfileClick = () => {
    navigate(`/profile/${post.author || "anonymous"}`);
  };

  return (
    <div className="post-card shadow-sm" style={styles.card}>
      {/* Post Header */}
      <div
        className="d-flex align-items-center p-3 border-bottom"
        style={{ cursor: "pointer" }}
        onClick={handleProfileClick}
      >
        {post.profilePic ? (
          <img
            src={post.profilePic}
            alt="User"
            className="rounded-circle me-2"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
        ) : (
          <div
            className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2"
            style={{ width: "40px", height: "40px", fontSize: "14px" }}
          >
            {post.author?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div>
          <strong>{post.author || "Anonymous"}</strong>
          <br />
          <small className="text-muted">{post.date}</small>
        </div>
      </div>

      {/* Post Image */}
      {post.image && <img src={post.image} alt="Post" style={styles.image} />}

      {/* Post Content */}
      <div style={styles.content}>
        <p style={styles.caption}>{post.caption}</p>

        {/* Like & Comment Count */}
        <div style={styles.meta}>
          <small className="text-muted me-3">❤️ {likeCount} Likes</small>
          <small className="text-muted">💬 {post.comments?.length || 0} Comments</small>
        </div>

        {/* Footer Actions */}
        <div style={styles.footer}>
          <div>
            <button
              onClick={toggleLike}
              style={{
                ...styles.iconBtn,
                backgroundColor: liked ? "#ff6b81" : "#eee",
              }}
            >
              ❤️ {liked ? "Liked" : "Like"}
            </button>

            <button
              style={styles.iconBtn}
              onClick={() =>
                onComment ? onComment(post.id) : alert("Comment feature coming soon!")
              }
            >
              💬 Comment
            </button>
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              style={styles.deleteBtn}
              title="Delete Post"
            >
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
