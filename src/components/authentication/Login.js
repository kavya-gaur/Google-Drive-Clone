import React, { useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";

export default function Login() {
  const { updateUser } = useAuth();

  const navigate = useNavigate();

  return (
    <div>
      <GoogleOAuthProvider /*clientId="195223591645-squh207v2cqhnqrcmt563e09savgiprv.apps.googleusercontent.com" */
        clientId="508058895476-9oqndkijfpdtppipeledurjs0vi4emas.apps.googleusercontent.com"
      >
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const user = jwt_decode(credentialResponse?.credential);
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
            // Store the data and navigate to home page
            if (user) {
              navigate("/");

              updateUser(user);
              Cookies.set("access_token", JSON.stringify(user), {
                expires: expirationDate,
                path: "/",
              });
            }
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </GoogleOAuthProvider>
    </div>
  );
}
