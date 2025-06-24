import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase"; // ✅ make sure this path is correct

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
        photoURL: profilePic || null,
      });

      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setProfilePic(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Signup</h2>
      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label>Name</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Profile Picture</label>
          <input type="file" className="form-control" onChange={handleImageChange} />
        </div>
        <button className="btn btn-primary">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
