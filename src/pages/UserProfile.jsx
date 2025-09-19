import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {

  const navigate = useNavigate();
  const { uid } = useParams(); // URL me userId milega
  const { user } = useAuth(); // current logged in user
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalList, setModalList] = useState([]);
  const [modalType, setModalType] = useState(""); // "Followers" or "Following"

  useEffect(() => {
    const fetchUser = async () => {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setIsFollowing(data.followers?.includes(user.uid));
      }
    };

    const fetchPosts = async () => {
      const postsRef = collection(db, "posts");
      const q = query(postsRef, where("authorId", "==", uid));
      const querySnap = await getDocs(q);
      setPosts(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchUser();
    fetchPosts();
  }, [uid, user.uid]);

  const handleFollow = async (targetUid) => {
    const userRef = doc(db, "users", targetUid);
    const currentUserRef = doc(db, "users", user.uid);

    const targetDataSnap = await getDoc(userRef);
    if (!targetDataSnap.exists()) return;

    const targetData = targetDataSnap.data();
    const followingAlready = targetData.followers?.includes(user.uid);

    if (followingAlready) {
      await updateDoc(userRef, { followers: arrayRemove(user.uid) });
      await updateDoc(currentUserRef, { following: arrayRemove(targetUid) });
    } else {
      await updateDoc(userRef, { followers: arrayUnion(user.uid) });
      await updateDoc(currentUserRef, { following: arrayUnion(targetUid) });
    }

    // Refresh data
    if (targetUid === uid) {
      setIsFollowing(!followingAlready);
    }

    // Update modal list
    setModalList((prev) =>
      prev.map((u) =>
        u.uid === targetUid
          ? { ...u, followers: followingAlready ? u.followers.filter((f) => f !== user.uid) : [...(u.followers || []), user.uid] }
          : u
      )
    );
  };

  const openListModal = async (type) => {
    if (!userData) return;

    const uids = type === "Followers" ? userData.followers : userData.following;
    if (!uids || uids.length === 0) {
      setModalList([]);
      setModalType(type);
      setShowModal(true);
      return;
    }

    const users = [];
    for (let id of uids) {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) users.push({ uid: id, ...docSnap.data() });
    }

    setModalList(users);
    setModalType(type);
    setShowModal(true);
  };

  if (!userData) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container my-5">
      <h2 className="text-center text-primary mb-4">👤 {userData.name}</h2>

      <div className="card p-4 shadow-sm border-0 rounded-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <img
            src={userData.photoURL || "https://via.placeholder.com/100"}
            alt="Profile"
            className="rounded-circle border"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
          <div>
            <h4>{userData.name}</h4>
            <p className="text-muted mb-0">{userData.email}</p>
            <div className="d-flex gap-4 mt-2">
              <span style={{ cursor: "pointer" }} onClick={() => openListModal("Followers")}>
                <strong>{userData.followers?.length || 0}</strong> Followers
              </span>
              <span style={{ cursor: "pointer" }} onClick={() => openListModal("Following")}>
                <strong>{userData.following?.length || 0}</strong> Following
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {user.uid !== uid && (
            <button
              className={`btn ${isFollowing ? "btn-danger" : "btn-success"}`}
              onClick={() => handleFollow(uid)}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      <h4 className="mb-3 text-secondary">📝 {userData.name}'s Posts</h4>
      <div className="row g-3">
        {posts.length === 0 ? (
          <p className="text-muted">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="col-sm-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="card-img-top"
                    style={{ maxHeight: "250px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <p>{post.caption}</p>
                  <small className="text-muted">{post.date}</small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalType}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
  {modalList.length === 0 ? (
    <p className="text-muted">No users</p>
  ) : (
    modalList.map((u) => (
      <div key={u.uid} className="d-flex align-items-center justify-content-between mb-2">
        <div 
          className="d-flex align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setShowModal(false); // close modal
            navigate(`/profile/${u.uid}`); // navigate to clicked user's profile
          }}
        >
          <img
            src={u.photoURL || "https://via.placeholder.com/40"}
            alt={u.name}
            className="rounded-circle me-2"
            style={{ width: "40px", height: "40px" }}
          />
          <span>{u.name}</span>
        </div>
        {u.uid !== user.uid && (
          <button
            className={`btn btn-sm ${u.followers?.includes(user.uid) ? "btn-danger" : "btn-success"}`}
            onClick={() => handleFollow(u.uid)}
          >
            {u.followers?.includes(user.uid) ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
    ))
  )}
</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
