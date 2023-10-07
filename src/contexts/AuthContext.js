import React, { useContext, useState, useEffect, createContext } from "react";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence, // Import the necessary module
} from "firebase/auth"; // Import the appropriate module for getAuth function
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children, app }) {
  const [currentUser, setCurrentUser] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence);

  function updateUser(user) {
    setCurrentUser(user);
    setLoading(true);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const saveduser = Cookies.get("access_token");

      try {
        const parsedUser = JSON.parse(saveduser);
        setCurrentUser(parsedUser);
        setLoading(true);
        if (!parsedUser) {
          navigate("/login");
        }
      } catch (error) {
        setLoading(true);
        navigate("/login");
      }
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    setCurrentUser,
    setLoading,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? "Loading" : children}
    </AuthContext.Provider>
  );
}
