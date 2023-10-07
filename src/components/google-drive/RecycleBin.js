import React, { useEffect, useState } from "react";
import NavBarComponent from "./NavBar";
import { Button, Container, Form, Modal } from "react-bootstrap";
import AddFolderButton from "./AddFolderButton";
import {
  permanentlyRemoveFile,
  permanentlyRemoveFolder,
  removeFile,
  removeFolder,
  removeFolderFiles,
  restoreFileHandler,
  restoreFolderHandler,
  useFolder,
} from "../../hooks/useFolder";
import Folder from "./Folder";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import FolderBreadcrumbs from "./FolderBreadcrumbs";
import AddFileButton from "./AddFileButton";
import File from "./File";
import {
  faTrash,
  faTrashArrowUp,
  faTrashRestore,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../contexts/AuthContext";
import AddRecycleBinButton from "./AddRecycleBinButton";
import { ref } from "firebase/storage";
import {
  arrayRemove,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { database, firestore } from "../App";

export default function RecycleBin() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const { currentUser, setCurrentUser } = useAuth();

  const [recycleBinFile, setRecycleBinFile] = useState(true);
  const [recycleBinFolder, setRecycleBinFolder] = useState(true);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recycleBinFolders, setRecycleBinFolders] = useState([]);
  const [recycleBinFiles, setRecycleBinFiles] = useState([]);

  const [folderDeletionDone, setFolderDeletionDone] = useState(true);
  const [fileDeletionDone, setFileDeletionDone] = useState(true);

  function closeRestoreModal() {
    setShowRestoreModal(false);
  }

  function openRestoreModal() {
    setShowRestoreModal(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function openModal() {
    setOpen(true);
  }

  function deleteAllHandler(e) {
    e.preventDefault();
    closeModal();
    recycleBinFolders.forEach(async (folder) => {
      await permanentlyRemoveFolder(folder, currentUser, setFolderDeletionDone);
    });

    recycleBinFiles.forEach(async (file) => {
      await permanentlyRemoveFile(file, currentUser, setFileDeletionDone);
    });
  }

  function restoreAllHandler(e) {
    e.preventDefault();
    closeRestoreModal();
    recycleBinFolders.forEach(async (folder) => {
      await restoreFolderHandler(folder, currentUser, setFolderDeletionDone);
    });

    recycleBinFiles.forEach(async (file) => {
      await restoreFileHandler(file, currentUser, setFileDeletionDone);
    });
  }
  useEffect(() => {
    const q = query(
      collection(firestore, "RecycleBinFolder"),
      where("userId", "==", currentUser.email),
      orderBy("createdAt")
    );

    const dummy = [];
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        if (folderDeletionDone) {
          dummy.length = 0;
          querySnapshot.forEach((doc) => {
            dummy.push(database.formatDoc(doc));
          });
        }

        setRecycleBinFolders(dummy);
        setLoading(true);
      } catch (error) {
        console.log("error in snapshot-", error);
      }
    });

    return () => {
      unsubscribe(); // Cleanup by unsubscribing from the snapshot listener
    };
  }, [currentUser]);

  useEffect(() => {}, [recycleBinFolders, recycleBinFiles]);

  useEffect(() => {
    const q = query(
      collection(firestore, "RecycleBinFile"),
      where("userId", "==", currentUser.email),
      orderBy("createdAt")
    );

    const dummy = [];
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        if (fileDeletionDone) {
          dummy.length = 0;
          querySnapshot.forEach((doc) => {
            dummy.push(database.formatDoc(doc));
          });
        }

        setRecycleBinFiles(dummy);
        setLoading(true);
      } catch (error) {
        console.log("error in snapshot-", error);
      }
    });

    return () => {
      unsubscribe(); // Cleanup by unsubscribing from the snapshot listener
    };
  }, [currentUser]);

  return (
    <>
      {!loading ? (
        ""
      ) : (
        <>
          <NavBarComponent />
          <Container fluid>
            <div className="d-flex align-items-center">
              <div
                style={{
                  textDecoration: "bold",
                  marginBottom: "1rem",
                  fontSize: "1.5rem",
                }}
              >
                Recycle Bin
              </div>

              <div style={{ marginLeft: "auto" }}>
                <Button
                  className="ml-2"
                  variant="outline-success"
                  size="sm"
                  style={{
                    marginRight: "10px",
                    marginLeft: "auto",
                  }}
                  onClick={openModal}
                >
                  <FontAwesomeIcon
                    style={{ height: "23px", width: "23px" }}
                    icon={faTrash}
                  />
                </Button>

                <Button
                  className="ml-2"
                  variant="outline-success"
                  size="sm"
                  style={{ marginRight: "10px", marginLeft: "auto" }}
                  onClick={openRestoreModal}
                >
                  <FontAwesomeIcon
                    style={{ height: "23px", width: "23px" }}
                    icon={faTrashArrowUp}
                  />
                </Button>
              </div>

              {/* </div> */}

              {/* <AddFileButton currentFolder={folder} />
            <AddFolderButton currentFolder={folder} />
            <AddRecycleBinButton /> */}
            </div>

            {/* {childFolders.length > 0 && childFiles.length > 0 && <hr />} */}
          </Container>

          <Modal show={open} onHide={closeModal}>
            <Form onSubmit={deleteAllHandler}>
              <Modal.Body>
                <Form.Group>
                  <Form.Label>
                    Are you sure you want to permanently delete all?
                  </Form.Label>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="danger" type="submit">
                  Yes
                </Button>
                <Button variant="secondary" onClick={closeModal}>
                  No
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          <Modal show={showRestoreModal} onHide={closeRestoreModal}>
            <Form onSubmit={restoreAllHandler}>
              <Modal.Body>
                <Form.Group>
                  <Form.Label>Are you sure you want to restore all?</Form.Label>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="danger" type="submit">
                  Yes
                </Button>
                <Button variant="secondary" onClick={closeRestoreModal}>
                  No
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
          {recycleBinFolders.length > 0 && (
            <>
              <div style={{ marginLeft: "10px", fontSize: "19px" }}>
                Folders
              </div>
              <div className="d-flex flex-wrap">
                {recycleBinFolders.map((childfolder) => (
                  <div
                    className="p-2"
                    key={childfolder.id}
                    style={{ maxWidth: "250px" }}
                  >
                    <Folder
                      activeContextMenu={activeContextMenu}
                      setActiveContextMenu={setActiveContextMenu}
                      recycleBinFolder={recycleBinFolder}
                      folder={childfolder}
                      setFolderDeletionDone={setFolderDeletionDone}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {recycleBinFiles.length > 0 && (
            <>
              <div style={{ marginLeft: "10px", fontSize: "19px" }}>Files</div>
              <div className="d-flex flex-wrap">
                {recycleBinFiles.map((childfile) => (
                  <div
                    className="p-2"
                    key={childfile.id}
                    style={{ maxWidth: "250px" }}
                  >
                    <File
                      activeContextMenu={activeContextMenu}
                      setActiveContextMenu={setActiveContextMenu}
                      recycleBinFile={recycleBinFile}
                      file={childfile}
                      setFileDeletionDone={setFileDeletionDone}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
