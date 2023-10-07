import React, { useState } from "react";
import { Card, Alert, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CenteredContainer from "./CenteredContainer";

export const Profile = () => {
  const [error, setError] = useState();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setError("");
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      setError("Failed to logout");
    }
  }
  return (
    <CenteredContainer>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Profile</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          <strong>Email: </strong>
          {currentUser.email}

          <Link to="/update-profile" className="btn btn-primary w-100 mt-3">
            Update Profile
          </Link>
        </Card.Body>
      </Card>

      <div className="w-100 text-center mt-2">
        <Button
          variant="link"
          style={{ textDecoration: "none" }}
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </div>
    </CenteredContainer>
  );
};
