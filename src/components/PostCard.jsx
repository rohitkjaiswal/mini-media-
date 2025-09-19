import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

const PostCard = ({ post, onDelete, onComment, onEdit }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [authorData, setAuthorData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();
  const [commentInputs,setCommentInputs]=useState([]);
  const currentUser = auth.currentUser;

  // 🔥 Real-time like + follow updates
  useEffect(() => {
    if (!post.id) return;

    // Post snapshot (likes/comments etc.)
    const postRef = doc(db, "posts", post.id);
    const unsubPost = onSnapshot(postRef, (snap) => {
      const data = snap.data();
      if (data) {
        setLikeCount(data.likedBy?.length || 0);
        setLiked(currentUser ? data.likedBy?.includes(currentUser.uid) : false);
      }
    });

    // Author snapshot (followers/following)
    if (post.authorId) {
      const authorRef = doc(db, "users", post.authorId);
      const unsubAuthor = onSnapshot(authorRef, (snap) => {
        const data = snap.data();
        setAuthorData(data);
        setIsFollowing(currentUser ? data?.followers?.includes(currentUser.uid) : false);
      });

      return () => {
        unsubPost();
        unsubAuthor();
      };
    }

    return () => unsubPost();
  }, [post.id, post.authorId, currentUser]);

  // ❤️ Toggle Like
  const toggleLike = async () => {
    if (!currentUser) return alert("Login required");
    const postRef = doc(db, "posts", post.id);

    if (liked) {
      await updateDoc(postRef, { likedBy: arrayRemove(currentUser.uid) });
    } else {
      await updateDoc(postRef, { likedBy: arrayUnion(currentUser.uid) });
    }
  };

  // ➕ Toggle Follow
  const toggleFollow = async () => {
    if (!currentUser || currentUser.uid === post.authorId) return;

    const userRef = doc(db, "users", currentUser.uid);
    const authorRef = doc(db, "users", post.authorId);

    if (isFollowing) {
      await updateDoc(authorRef, { followers: arrayRemove(currentUser.uid) });
      await updateDoc(userRef, { following: arrayRemove(post.authorId) });
    } else {
      await updateDoc(authorRef, { followers: arrayUnion(currentUser.uid) });
      await updateDoc(userRef, { following: arrayUnion(post.authorId) });
    }
  };

  // 🖊 Edit handler
  const handleEdit = () => {
    if (onEdit) onEdit(post);
    else alert("Edit feature coming soon!");
  };

  // 👤 Profile click
  const handleProfileClick = () => {
    navigate(`/profile/${post?.authorId || "anonymous"}`);
  };

  // 💬 Submit Comment
    const handleCommentSubmit = async (id) => {
      const commentText = commentInputs[id]?.trim();
      if (!commentText) return;
  
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        comments: arrayUnion(commentText),
      });
  
      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
    };

  return (
    <div className="post-card shadow-sm" style={styles.card}>
      {/* Header */}
      <div className="d-flex align-items-center p-3 border-bottom">
        {post.photoURL ? (
          <img
            src={post?.profilePic || post.profilePic}
            alt="User"
            className="rounded-circle me-2"
            style={styles.avatar}
            onClick={handleProfileClick}
          />
        ) : (
          <div
            onClick={handleProfileClick}
            className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2"
            style={styles.avatar}
          >
            {post.displayName?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div>
          <span
            onClick={handleProfileClick}
            className="fw-bold text-primary"
            style={{ cursor: "pointer" }}
          >
            {post.authorId?.name || "Anonymous"}
          </span>
          <br />
          <small className="text-muted">{post.date}</small>
        </div>
        {post.authorId?.id === auth.uid && (
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
          {/* <small className="text-muted me-3">{}</small> */}
          <small className="text-muted">💬 {post.comments?.length || 0} Comments</small>
        </div>

        {/* Action Buttons */}
        <div style={styles.footer}>
          <div>
            <button
              onClick={toggleLike}
              style={{
                ...styles.iconBtn,
                
                color: "#000",
              }}
            >
               {liked ? "❤️" : "🤍"}{likeCount}
            </button>
          
          <div className="card mb-3 shadow-sm">
      

      <div >
        <button
          className="btn  btn-sm"
          onClick={() => setShowComments(true)}
        >
          💬 {post.comments?.length || 0} Comments
        </button>
      </div>

      {/* Comments Modal */}
      <div
        className={`modal fade ${showComments ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-scrollable" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title p-0" >Comments</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowComments(false)}
              ></button>
            </div>
            <div className="modal-body">
              {post.comments?.length > 0 ? (
                <ul className="list-group">
                  {post.comments.map((c, idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex align-items-center"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/profile/${c.userId}`)}
                    >
                      <img
                        src={c.photoURL || "https://via.placeholder.com/40"}
                        alt={c.userName}
                        className="rounded-circle me-2"
                        style={{ width: "40px", height: "40px" }}
                      />
                      <div>
                        <strong>{c.userName}</strong>
                        <p className="mb-0">{c.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No comments yet</p>
              )}
            </div>
            <div className="modal-footer">

              <span className="text-muted me-2">
                {post.comments?.length} {post.comments?.length > 1 ? "comments" : "comment"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

          

            {post.authorId === currentUser?.uid && (
              <button onClick={handleEdit} style={styles.iconBtn}>
                ✏️ Edit
              </button>
            )}
          </div>


          {post.authorId === currentUser?.uid && (
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
