import React, { useRef, useState } from "react";
import { Button, Card, Form, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { updateEmail, updatePassword } from "firebase/auth";
import CenteredContainer from "./CenteredContainer";

export default function ForgotPassword() {
  const emailRef = useRef();
  const { currentUser, resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage("Check your inbox for further instructions");
    } catch {
      setError("Failed to reset password");
    }
    setLoading(false);
  }

  return (
    <CenteredContainer>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Forgot Password</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          {currentUser && currentUser.email}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                className="mb-3"
                type="email"
                ref={emailRef}
                required
              ></Form.Control>
            </Form.Group>

            <Button disabled={loading} className="w-100" type="submit">
              Reset password
            </Button>
          </Form>
          <div className="w-100 text-center mt-2">
            <Link to={"/login"} style={{ textDecoration: "none" }}>
              Login
            </Link>
          </div>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an Account?{" "}
        <Link to={"/signup"} style={{ textDecoration: "none" }}>
          Sign Up
        </Link>
      </div>
    </CenteredContainer>
  );
}
