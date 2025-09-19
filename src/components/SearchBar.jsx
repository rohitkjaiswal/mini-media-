// src/components/SearchBar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const db = getFirestore();


  async function searchUserByName(name) {
    if (!name.trim()) {
      setResults([]);
      return;
    }

    try {
      // Partial search query
      const q = query(
        collection(db, "users"),
        where("name", ">=", name),
        where("name", "<=", name + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);

      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      setResults(users);
    } catch (error) {
      console.error("Error searching user:", error);
    }
  }

  return (
    <div className="mb-4 p-3" style={{ margin: "auto" }}>
      <input
        type="search"
        className="form-control"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => {
          const value = e.target.value;
          setSearchTerm(value);
          searchUserByName(value); // live search
        }}
      />

      {results.length > 0 && (
        <ul className="list-group mt-3">
          {results.map((user) => (
           <li key={user.id} className="list-group-item d-flex align-items-center">
  <Link to={`/profile/${user.id}`} className="d-flex align-items-center text-decoration-none text-dark">
    <img
      src={user.photoURL || "https://via.placeholder.com/40"}
      alt={user.name}
      className="rounded-circle me-2"
      style={{ width: "40px", height: "40px" }}
    />
    <div>
      <strong>{user.name}</strong> <br />
      <small>{user.email}</small>
    </div>
  </Link>
</li>
          ))}
        </ul>
      )}

      {results.length === 0 && searchTerm && (
        <p className="text-muted mt-2">No users found</p>
      )}
    </div>
  );
};

export default SearchBar;
