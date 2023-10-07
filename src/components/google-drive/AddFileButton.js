import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { firestore } from "../App";
import { useAuth } from "../../contexts/AuthContext";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { ROOT_FOLDER } from "../../hooks/useFolder";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { ProgressBar, Toast, ToastHeader } from "react-bootstrap";
import ReactDOM from "react-dom";

export default function AddFileButton({ currentFolder }) {
  const storage = getStorage();
  const { currentUser } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState([]);

  async function uploadFile(file, id) {
    const names = currentFolder.path.map((obj) => obj.name);
    const a = names.join("/");
    const filePath =
      currentFolder === ROOT_FOLDER
        ? `${file.name}`
        : `${a}/${currentFolder.name}/${file.name}`;

    const storageRef = ref(storage, `/files/${currentUser.email}/${filePath}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "progress",
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;

        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.map((uploadFile) => {
            if (uploadFile.id === id) {
              return { ...uploadFile, progress: progress };
            }
            return uploadFile;
          });
        });
      },
      () => {
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.map((uploadFile) => {
            if (uploadFile.id === id) {
              return { ...uploadFile, error: true };
            }
            return uploadFile;
          });
        });
      },
      () => {
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.filter((uploadFile) => {
            return uploadFile.id !== id;
          });
        });
      }
    );

    try {
      const snapshot = await uploadTask;

      const downloadURL = await getDownloadURL(snapshot.ref);

      const q = query(
        collection(firestore, "Files"),
        where("name", "==", file.name),
        where("userId", "==", currentUser.email),
        where("folderId", "==", currentFolder.id)
      );
      const existingFiles = await getDocs(q);

      if (existingFiles.size > 0) {
        // File already exists, update the file using updateDoc
        const existingFile = existingFiles.docs[0];
        await updateDoc(doc(firestore, "Files", existingFile.id), {
          url: downloadURL,
        });
      } else {
        await addDoc(collection(firestore, "Files"), {
          url: downloadURL,
          name: file.name,
          folderId: currentFolder.id,
          userId: currentUser.email,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function handleUpload(e) {
    const selectedFiles = Array.from(e.target.files);
    selectedFiles.forEach((file, i) => {
      if (currentFolder == null || file == null) return;

      const id = uuid();
      setUploadingFiles((prevUploadingFiles) => [
        ...prevUploadingFiles,
        {
          id: id,
          name: file.name,
          progress: 0,
          error: false,
        },
      ]);

      uploadFile(file, id);
    });
  }

  return (
    <>
      <label className="btn btn-outline-success btn-sm m-2 mr-2">
        <FontAwesomeIcon
          style={{ height: "23px", width: "23px" }}
          icon={faFileUpload}
        />
        <input
          type="file"
          onChange={handleUpload}
          style={{ opacity: 0, position: "absolute", left: "-9999px" }}
          multiple
        ></input>
      </label>
      {uploadingFiles.length > 0 &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              maxWidth: "250px",
            }}
          >
            {uploadingFiles.map((file) => (
              <Toast
                key={file.id}
                onClose={() => {
                  setUploadingFiles((prevUploadingFiles) => {
                    return prevUploadingFiles.filter((uploadFile) => {
                      return uploadFile.id !== file.id;
                    });
                  });
                }}
              >
                <ToastHeader
                  closeButton={file.error}
                  className="text-truncate w-100 d-block"
                >
                  {file.name}
                </ToastHeader>
                <Toast.Body>
                  <ProgressBar
                    animated={!file.error}
                    variant={file.error ? "danger" : "primary"}
                    now={file.error ? 100 : file.progress * 100}
                    label={
                      file.error
                        ? "Error"
                        : `${Math.round(file.progress * 100)}%`
                    }
                  ></ProgressBar>
                </Toast.Body>
              </Toast>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
