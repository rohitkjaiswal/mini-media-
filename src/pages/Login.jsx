 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { signInWithGoogle } from "../firebase";
import { saveLoggedInUser } from "../utils/storage"; 
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try{
      const user=await signInWithGoogle();
      
      const customUser={
        email: user.email,
        name: user.displayName || user.email.split("@")[0],
        profilePic: user.photoURL || "",
      };
      saveLoggedInUser(customUser); // Store user info
      alert("✅ Logged in successfully!");
      navigate("/profile"); // navigate to profile  

    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      //Save user data to localStorage
      const customUser = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        profilePic: firebaseUser.photoURL || "",
        password: password,
      };

      saveLoggedInUser(customUser); // Store user info

      alert("✅ Logged in successfully!");
      navigate("/profile"); // navigate to profile
    } catch (error) {
      alert("❌ Invalid credentials!\n" + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <div className="card p-4 shadow-lg border-0 rounded-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-3">🔐 Welcome Back!</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">📧 Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="example@email.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">🔑 Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="••••••••"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          
          <button className="btn btn-outline-secondary w-100" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "🚀 Login"}
          </button>
          <button className="btn btn-outline-primary w-100 mt-2" type="button" onClick={handleGoogleSignIn} >
            Sign in with Google
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-muted">
            Don’t have an account?{" "}
            <span
              className="text-primary fw-bold"
              role="button"
              onClick={() => navigate("/signup")}
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
