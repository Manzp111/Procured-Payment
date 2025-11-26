import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Headers.css";

interface User {
  name: string;
  role: string;
  avatar?: string;
}

const Header: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-3">
      <a className="navbar-brand fw-bold" href="#">
        IST Dashboard
      </a>
      <div className="d-flex align-items-center ms-auto gap-3">
        <span className="text-secondary">Role: {user.role}</span>
        <div className="dropdown">
          <img
            src={user.avatar || "https://via.placeholder.com/40"}
            className="rounded-circle header-avatar"
            alt="profile"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ width: "40px", height: "40px", cursor: "pointer" }}
          />
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="dropdownMenuButton"
          >
            <li>
              <a className="dropdown-item" href="#">
                Profile
              </a>
            </li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;