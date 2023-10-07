import React, { useEffect, useState } from "react";
import NavBarComponent from "./NavBar";
import { Button, Container, Form, Modal } from "react-bootstrap";
import AddFolderButton from "./AddFolderButton";
import {
  removeFile,
  removeFolder,
  removeFolderFiles,
  useFolder,
} from "../../hooks/useFolder";
import Folder from "./Folder";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import FolderBreadcrumbs from "./FolderBreadcrumbs";
import AddFileButton from "./AddFileButton";
import File from "./File";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../contexts/AuthContext";
import AddRecycleBinButton from "./AddRecycleBinButton";
import Cookies from "js-cookie";

export default function Dashboard() {
  const { folderId } = useParams();
  const { state = {} } = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const { currentUser, setCurrentUser, setLoading } = useAuth();
  const [activeContextMenu, setActiveContextMenu] = useState(false);

  const { folder, childFolders, childFiles } = useFolder(
    folderId,
    state?.folder
  );

  function closeModal() {
    setOpen(false);
  }

  function openModal() {
    setOpen(true);
  }

  function removeCurrentFolderHandler(e) {
    e.preventDefault();

    childFolders.forEach((childFolder) =>
      removeFolder(childFolder, currentUser)
    );
    childFiles.forEach((childFile) => removeFile(childFile, currentUser));

    closeModal();
  }

  return (
    <>
      <NavBarComponent />

      <Container fluid>
        <div className="d-flex align-items-center">
          <FolderBreadcrumbs
            style={{ marginBottom: "10px", fontSize: "100px" }}
            currentFolder={folder}
          />

          <Button
            className="ml-2"
            variant="outline-success"
            size="sm"
            style={{ marginRight: "10px" }}
            onClick={openModal}
          >
            <FontAwesomeIcon
              style={{ height: "23px", width: "23px" }}
              icon={faTrash}
            />
          </Button>

          <AddFileButton currentFolder={folder} />
          <AddFolderButton currentFolder={folder} />
          <AddRecycleBinButton />
        </div>

        {childFolders.length > 0 && (
          <>
            <div style={{ marginLeft: "10px", fontSize: "19px" }}>Folders</div>

            <div className="d-flex flex-wrap">
              {childFolders.map((childfolder) => (
                <div
                  className="p-2"
                  key={childfolder.id}
                  style={{ maxWidth: "400px" }}
                >
                  <Folder
                    activeContextMenu={activeContextMenu}
                    setActiveContextMenu={setActiveContextMenu}
                    folder={childfolder}
                    parentFolder={folder}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {childFolders.length > 0 && childFiles.length > 0 && <hr />}

        {childFiles.length > 0 && (
          <>
            <div style={{ marginLeft: "10px", fontSize: "19px" }}>Files</div>

            <div className="d-flex flex-wrap">
              {childFiles.map((childfile) => (
                <div
                  className="p-2"
                  key={childfile.id}
                  style={{ maxWidth: "250px" }}
                >
                  <File file={childfile} />
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
      <Modal show={open} onHide={closeModal}>
        <Form onSubmit={removeCurrentFolderHandler}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Are you sure you want to delete all?</Form.Label>
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
    </>
  );
}
