// src/components/SearchBar.jsx
import React from "react";

const SearchBar = ({ value, onChange }) => (
  <div className="mb-4">
    <input
      type="search"
      className="form-control"
      placeholder="Search by caption or author..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
