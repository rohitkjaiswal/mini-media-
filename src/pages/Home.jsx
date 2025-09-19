import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, deleteDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import PostCard from "../components/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const currentUser = auth.currentUser;

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

  // 🗑 Delete Post
  const handleDelete = async (id) => {
    if (window.confirm("🗑️ Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "posts", id));
      setPosts((prev) => prev.filter((post) => post.id !== id));
    }
  };

  // 💬 Comment Input Change
  const handleCommentChange = (id, value) => {
    setCommentInputs((prev) => ({ ...prev, [id]: value }));
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
    <div className="container my-5">
      <h2 className="text-center fw-bold text-primary mb-5">✨ Latest Moments</h2>

      {posts.length === 0 ? (
        <div className="text-center text-muted fs-5">
          😕 No posts available.
          <br />
          Start sharing your thoughts!
        </div>
      ) : (
        <div className="row g-4">
          {posts.map((post) => (
            <div key={post.id} className="col-sm-12 col-md-6 col-lg-4">
              <PostCard
                post={post}
                onDelete={handleDelete}
                onComment={(id) => handleCommentSubmit(id)}
              />

              {/* Comment Section */}
              <div className="mt-3">
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control rounded-start"
                    placeholder="💬 Add a comment..."
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
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
                      <div key={index} className="border-bottom py-1 small">
                        <span className="text-dark">💬 {cmt}</span>
                      </div>
                    ))
                  )}
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
