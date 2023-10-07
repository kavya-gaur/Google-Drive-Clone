import React, { useRef, useState } from "react";
import { Button, Card, Form, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import CenteredContainer from "./CenteredContainer";

export default function UpdateProfile() {
  const emailRef = useRef();
  const currentPasswordRef = useRef(); // New ref for current password
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const {
    currentUser,
    updateUserEmail,
    updateUserPassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
  } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Reauthenticate before updating email or password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPasswordRef.current.value
      );
      await reauthenticateWithCredential(currentUser, credential);

      const promises = [];

      if (emailRef.current.value !== currentUser.email) {
        promises.push(updateUserEmail(emailRef.current.value));
      }

      if (passwordRef.current.value) {
        promises.push(updateUserPassword(passwordRef.current.value));
      }

      await Promise.all(promises);
      navigate("/user");
    } catch (error) {
      setError("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CenteredContainer>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required></Form.Control>
            </Form.Group>

            <Form.Group id="current-password">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                ref={currentPasswordRef}
                required
              ></Form.Control>
            </Form.Group>

            <Form.Group id="password">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                ref={passwordRef}
                placeholder="Leave blank to keep the same"
              ></Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" id="password-confirm">
              <Form.Label>New Password Confirmation</Form.Label>
              <Form.Control
                type="password"
                ref={passwordConfirmRef}
                placeholder="Leave blank to keep the same"
              ></Form.Control>
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">
              Update
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link style={{ textDecoration: "none" }} to={"/user"}>
          Cancel
        </Link>
      </div>
    </CenteredContainer>
  );
}
