import React, { useState } from "react";
import { Navbar, Nav, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import image from "../../photo.png";
import { useAuth } from "../../contexts/AuthContext";
import Cookies from "js-cookie";

export default function NavBarComponent() {
  const { currentUser, setCurrentUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  async function logoutHandler() {
    Cookies.remove("access_token");
    console.log(Cookies.get("access_token"));
    setCurrentUser(null);
    navigate("/login");
  }
  return (
    <>
      <Navbar bg="light" expand="sm">
        <Nav className="container-fluid">
          <Navbar.Brand className="d-flex align-items-center">
            <img
              src={image}
              alt="Logo"
              style={{ width: "50px", height: "50px", marginLeft: "20px" }}
            />

            <div style={{ position: "relative" }}>
              <a
                href="/"
                style={{
                  textDecoration: "none",
                  marginLeft: "10px",
                  color: "black",
                  fontSize: "25px",
                  marginLeft: "20px",
                }}
              >
                My Drive
              </a>
              <Dropdown.Menu
                style={{
                  position: "absolute",
                  zIndex: 1,
                  top: "calc(2rem)",
                  left: "81.5rem",
                  minWidth: "9rem",
                }}
                show={showDropdown}
              >
                <Dropdown.Item
                  onClick={logoutHandler}
                  style={{ textAlign: "center" }}
                >
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </div>
          </Navbar.Brand>
          <Nav.Item className="ml-auto">
            <Nav.Link style={{ fontSize: "20px" }}>
              <img
                src={currentUser.picture}
                style={{
                  height: "2.1rem",
                  width: "2.1rem",
                  borderRadius: "1rem",
                  marginBottom: "1rem",
                }}
                onClick={() => setShowDropdown(!showDropdown)}
                alt="User image"
              />
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Navbar>
    </>
  );
}
