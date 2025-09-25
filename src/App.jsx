// App.jsx
import { Routes, Route, useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import PostForm from "./components/PostForm";
import Profile from "./pages/Profile"; 
import UserProfile from "./pages/UserProfile";
import SearchBar from "./components/SearchBar";

function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<PostForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
       <Route path="/profile">
  <Route index element={<Profile />} />   {/* /profile */}
  <Route path=":uid" element={<UserProfile />} /> {/* /profile/:uid */}
</Route>

        <Route path="/SearchUser" element={<SearchBar />} />

        <Route path="/create" element={<CreatePost />} />
        
      </Routes>
    </>
  );
}

export default App;
