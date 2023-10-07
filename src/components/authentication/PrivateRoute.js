import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  console.log(currentUser);
  return currentUser ? children : <Navigate to="/login" />;
}
