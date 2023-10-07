import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus } from "@fortawesome/free-solid-svg-icons";
import { firestore } from "../App";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { ROOT_FOLDER } from "../../hooks/useFolder";

export default function AddFolderButton({ currentFolder }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { currentUser } = useAuth();

  async function submitHandler(e) {
    e.preventDefault();
    if (currentFolder == null) return;

    const path = [...currentFolder.path];
    if (currentFolder !== ROOT_FOLDER) {
      path.push({ name: currentFolder.name, id: currentFolder.id });
    }

    //Create folder in database
    try {
      const a = await addDoc(collection(firestore, "Folders"), {
        name: name,
        parentId: currentFolder.id,
        userId: currentUser.email,
        path: path,
        createdAt: serverTimestamp(),
      });
      if (a) setName("");
      closeModal();
    } catch (error) {}
  }

  function openModal() {
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  return (
    <>
      <Button
        className="ml-2"
        onClick={openModal}
        variant="outline-success"
        size="sm"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <FontAwesomeIcon
          style={{ height: "23px", width: "23px" }}
          icon={faFolderPlus}
        />
      </Button>
      <Modal show={open} onHide={closeModal}>
        <Form onSubmit={submitHandler}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Folder Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
            <Button variant="success" type="submit">
              Add Folder
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
