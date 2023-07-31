import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <Link className="nav-link" to="/"> Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/Registration"> Registration </Link>
            </li>
            <li className="nav-item">
            <Link className="nav-link" to="/Login"> Login </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
