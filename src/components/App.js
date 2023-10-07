import Signup from "./authentication/Signup";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../contexts/AuthContext";
import { app } from "../firebase";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Profile } from "./authentication/Profile";
import Login from "./authentication/Login";
import PrivateRoute from "./authentication/PrivateRoute";
import ForgotPassword from "./authentication/ForgotPassword";
import UpdateProfile from "./authentication/UpdateProfile";
import CenteredContainer from "./authentication/CenteredContainer";
import Dashboard from "./google-drive/Dashboard";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";

import RecycleBin from "./google-drive/RecycleBin";

function App() {
  return (
    <Router>
      <AuthProvider app={app}>
        <Routes>
          <Route
            exact
            path="/"
            element={<PrivateRoute>{<Dashboard />}</PrivateRoute>}
          ></Route>

          <Route
            exact
            path="/folder/:folderId"
            element={<PrivateRoute>{<Dashboard />}</PrivateRoute>}
          ></Route>

          <Route
            exact
            path="/recyclebin"
            element={<PrivateRoute>{<RecycleBin />}</PrivateRoute>}
          ></Route>

          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export const firestore = getFirestore();

export const database = {
  folders: collection(firestore, "folders"),
  files: collection(firestore, "files"),
  formatDoc: (doc) => {
    return { id: doc.id, ...doc.data() };
  },
};

export default App;
