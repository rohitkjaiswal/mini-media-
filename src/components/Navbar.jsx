// components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const defaultProfilePic = "/default-profile.png";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-white");
  };

  return (
    <nav className={`navbar navbar-expand-lg ${isDark ? "navbar-dark bg-dark" : "navbar-light bg-light"} px-4 shadow-sm`}>
      <Link className="navbar-brand fw-bold text-primary" to="/">
        📱 MySocial
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarContent">

        <ul className="navbar-nav ms-auto align-items-center gap-3">
          <li className="nav-item">
            <Link className="nav-link" to="/SearchUser">
              🔍 Search User
            </Link>
          </li>
          <li className="nav-item">
            <button
              className={`btn btn-sm ${isDark ? "btn-light" : "btn-dark"}`}
              onClick={toggleTheme}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </li>

          {user && (
            <li className="nav-item">
              <span className="fs-5" role="img" aria-label="notif">
                🔔
              </span>
            </li>
          )}

          {!user ? (
            <>
              <li className="nav-item">
                <Link className="btn btn-outline-primary" to="/login">
                  🔐 Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-primary" to="/signup">
                  ✍️ Signup
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="btn btn-outline-info nav-item" style={{direction:"none"}}>
                <Link  to="/create">
                 Create Post
                </Link>
              </li>

              {/* ✅ CLICKABLE Profile Section */}
              <li className="nav-item d-flex align-items-center">
                <Link
                  to="/profile"
                  className="d-flex align-items-center text-decoration-none"
                >
                  <img
                    src={user.photoURL || defaultProfilePic}
                    alt="user"
                    className="rounded-circle border"
                    style={{
                      width: "35px",
                      height: "35px",
                      objectFit: "cover",
                      marginRight: "8px",
                    }}
                    onError={(e) => (e.target.src = defaultProfilePic)}
                  />
                  <span className="text-muted small d-none d-md-inline">
                    {user.displayName || user.email}
                  </span>
                </Link>
              </li>

              <li className="nav-item">
                <button className="btn btn-danger" onClick={handleLogout}>
                  🔓 Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
