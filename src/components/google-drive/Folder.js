import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button, Dropdown, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  permanentlyRemoveFolder,
  removeFolder,
  restoreFolderHandler,
} from "../../hooks/useFolder";
import { useAuth } from "../../contexts/AuthContext";

export default function Folder({
  folder,

  recycleBinFolder = false,
  activeContextMenu,
  setActiveContextMenu,
  setFolderDeletionDone,
}) {
  const { currentUser } = useAuth();
  const [rightClick, setRightClick] = useState(false);

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function closeModal() {
    setOpen(false);
  }

  function openModal() {
    setOpen(true);
  }

  function removeChildFolderHandler(e) {
    e.preventDefault();
    setActiveContextMenu(false);

    if (!recycleBinFolder) removeFolder(folder, currentUser);
    else permanentlyRemoveFolder(folder, currentUser, setFolderDeletionDone);
    closeModal();
  }

  function restoreFolder(e) {
    e.preventDefault();

    restoreFolderHandler(folder, currentUser, setFolderDeletionDone);
  }

  function folderopenerhandler() {
    navigate(`/folder/${folder.id}`);
  }
  function downloadHandler() {
    setActiveContextMenu(false);
  }

  function contextMenuHandler(e, folder) {
    e.preventDefault();
    setRightClick(true);
    setActiveContextMenu(true);
    document.addEventListener("click", closeContextMenu);
  }

  function closeContextMenu() {
    setRightClick(false);
    setActiveContextMenu(false);
    document.removeEventListener("click", closeContextMenu);
  }

  function restoreRecycleBinFolder() {}

  //it is a normal folder
  if (!recycleBinFolder) {
    return (
      <>
        <Dropdown
          onContextMenu={
            activeContextMenu ? "" : (e) => contextMenuHandler(e, folder.id)
          }
          onDoubleClick={folderopenerhandler}
        >
          <Button
            variant="btn"
            style={{ borderColor: "black" }}
            className={`text-truncate w-100`}
          >
            <FontAwesomeIcon icon={faFolder} style={{ marginRight: "7px" }} />

            {folder.name}

            <Dropdown.Menu show={rightClick}>
              <Dropdown.Item onClick={removeChildFolderHandler}>
                Remove
              </Dropdown.Item>
              <Dropdown.Item onClick={restoreRecycleBinFolder}></Dropdown.Item>
            </Dropdown.Menu>
          </Button>
        </Dropdown>

        <Modal show={open} onHide={closeModal}>
          <Form onSubmit={(e) => removeChildFolderHandler(e)}>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Are you sure you want to delete?</Form.Label>
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

  //recycle bin folder
  else {
    return (
      <>
        <Dropdown
          onContextMenu={
            activeContextMenu ? "" : (e) => contextMenuHandler(e, folder.id)
          }
        >
          <Button
            variant="btn"
            style={{ borderColor: "black" }}
            className={`text-truncate w-100`}
          >
            <FontAwesomeIcon icon={faFolder} style={{ marginRight: "7px" }} />

            {folder.name}

            <Dropdown.Menu show={rightClick}>
              <Dropdown.Item onClick={openModal}>Remove</Dropdown.Item>
              <Dropdown.Item onClick={restoreFolder}>Restore</Dropdown.Item>
            </Dropdown.Menu>
          </Button>
        </Dropdown>

        <Modal show={open} onHide={closeModal}>
          <Form onSubmit={(e) => removeChildFolderHandler(e)}>
            <Modal.Body>
              <Form.Group>
                <Form.Label>
                  Are you sure you want to permanently delete?
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
      </>
    );
  }
}
