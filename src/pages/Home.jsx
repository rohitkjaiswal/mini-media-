import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const defaultProfilePic = "/default-profile.png";

  useEffect(() => {
    const postsRef = collection(db, "posts");
    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const sorted = newPosts.sort((a, b) => b.timestamp - a.timestamp);
      setPosts(sorted);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("🗑️ Are you sure you want to delete this post?");
    if (confirmDelete) {
      await deleteDoc(doc(db, "posts", id));
      setPosts((prev) => prev.filter((post) => post.id !== id));
    }
  };

  const handleCommentChange = (id, value) => {
    setCommentInputs((prev) => ({ ...prev, [id]: value }));
  };

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
    <div className="container my-5">
      <h2 className="text-center fw-bold text-primary mb-5">
        ✨ Latest Moments
      </h2>

      {posts.length === 0 ? (
        <div className="text-center text-muted fs-5">
          😕 No posts available.<br />Start sharing your thoughts!
        </div>
      ) : (
        <div className="row g-4">
          {posts.map((post) => (
            <div key={post.id} className="col-sm-12 col-md-6 col-lg-4">
              <div
                className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden post-card"
                style={{ transition: "transform 0.2s" }}
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt="post"
                    className="card-img-top"
                    style={{
                      filter: post.filter || "none",
                      height: "280px",
                      objectFit: "cover",
                    }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}

                <div className="card-body d-flex flex-column justify-content-between">
                  <p className="card-text mb-3">{post.caption}</p>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={post.profilePic || defaultProfilePic}
                        alt="author"
                        className="rounded-circle border"
                        style={{
                          width: "42px",
                          height: "42px",
                          objectFit: "cover",
                        }}
                        onError={(e) => (e.target.src = defaultProfilePic)}
                      />
                      <div>
                        <strong>{post.author}</strong>
                        <br />
                        <small className="text-muted">{post.date}</small>
                      </div>
                    </div>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(post.id)}
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Comments */}
                  <div className="comment-section">
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control rounded-start"
                        placeholder="💬 Add a comment..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          handleCommentChange(post.id, e.target.value)
                        }
                      />
                      <button
                        className="btn btn-primary rounded-end"
                        onClick={() => handleCommentSubmit(post.id)}
                      >
                        ➤
                      </button>
                    </div>

                    <div
                      className="bg-light p-2 rounded shadow-sm"
                      style={{ maxHeight: "120px", overflowY: "auto" }}
                    >
                      {(post.comments || []).length === 0 ? (
                        <div className="text-muted">No comments yet.</div>
                      ) : (
                        post.comments.map((cmt, index) => (
                          <div
                            key={index}
                            className="border-bottom py-1 small"
                          >
                            <span className="text-dark">💬 {cmt}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
