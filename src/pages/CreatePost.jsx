import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // Firebase setup
import { doc, getDoc } from "firebase/firestore";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const CreatePost = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handlePost = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("⚠️ Please login first.");
      return;
    }

    if (!caption.trim()) {
      setError("Caption is required!");
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : { name:"Anonymous", profilePic: "" };

      const newPost = {
        authorId: user.uid,
        image: image.trim() || null,
        caption,
        date: new Date().toLocaleString(),
        author: userData.name || "User",
        profilePic: userData.profilePic || "",
        timestamp: serverTimestamp(),
        comments: [],
      };

      await addDoc(collection(db, "posts"), newPost);

      alert("✅ Post created!");
      setCaption("");
      setImage("");
      navigate("/");
    } catch (err) {
      console.error("Error creating post:", err);
      setError("❌ Failed to create post. Try again.");
    }
  };

  if (!user) {
    return <p className="text-center mt-5">⚠️ Please login first to create a post.</p>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h3 className="mb-4 text-primary">📝 Create New Post</h3>

      <form onSubmit={handlePost} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">
            Caption <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="3"
            placeholder="What's on your mind?"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Image URL (optional)</label>
          <input
            type="text"
            className="form-control"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {image && (
          <div className="text-center mb-3">
            <img
              src={image}
              alt="Preview"
              style={{
                maxHeight: "300px",
                borderRadius: "10px",
                objectFit: "cover",
                maxWidth: "100%",
              }}
              onError={() => setImage("")}
            />
          </div>
        )}

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button type="submit" className="btn btn-success w-100">
          Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
