import {
  faArrowsDownToLine,
  faDownload,
  faFile,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Button, Dropdown, Form, Modal } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import {
  permanentlyRemoveFile,
  removeFile,
  restoreFileHandler,
} from "../../hooks/useFolder";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, refFromURL } from "firebase/storage";

export default function File({
  file,
  activeContextMenu,
  setActiveContextMenu,
  setFileDeletionDone,
  recycleBinFile = false,
}) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [rightClick, setRightClick] = useState(false);

  const storage = getStorage();

  function openModal() {
    setOpen(true);
  }
  function closeModal() {
    setOpen(false);
  }

  function restoreFile(e) {
    e.preventDefault();
    restoreFileHandler(file, currentUser, setFileDeletionDone);
  }

  function removeFileHandler(e) {
    e.preventDefault();

    //if it is only first delete
    if (!recycleBinFile) removeFile(file, currentUser);
    //deleting permanently from recycle bin
    else {
      permanentlyRemoveFile(file, currentUser, setFileDeletionDone);
    }
  }

  async function downloadHandler() {
    try {
      // Get the download URL

      // download image directly via url
      var xhr = new XMLHttpRequest();
      xhr.responseType = "blob";
      xhr.onload = (event) => {
        var blob = xhr.response;
        //create a file from the returned blob
        var file = new File([blob], "image name", { type: blob.type });
        //grab the a tag
        const a1 = document.getElementById("tagID");
        //set the download attribute of the a tag to the name stored in the file
        a1.download = file.name;
        //generate a temp url to host the image for download
        a1.href = URL.createObjectURL(file);
      };
      xhr.open("GET", file.url);
      xhr.send();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  function fileopenerhandler() {
    const a = document.createElement("a");
    a.href = file.url;
    a.click();
  }

  function contextMenuHandler(e, file) {
    e.preventDefault();
    setRightClick(true);

    document.addEventListener("click", closeContextMenu);
  }

  function closeContextMenu() {
    setRightClick(false);

    document.removeEventListener("click", closeContextMenu);
  }

  if (!recycleBinFile) {
    return (
      <>
        <Dropdown
          onContextMenu={
            activeContextMenu ? "" : (e) => contextMenuHandler(e, file.id)
          }
        >
          <a
            onDoubleClick={fileopenerhandler}
            className="btn"
            target="_blank"
            style={{ borderColor: "black" }}
          >
            <FontAwesomeIcon
              icon={faFile}
              style={{ marginRight: "8px" }}
              className="mr-5"
            ></FontAwesomeIcon>
            {file.name}

            <Dropdown.Toggle
              split
              variant="btn-light"
              style={{
                border: "none",
                paddingLeft: "20px",
                color: "white",
              }}
              className={open ? "bg-white" : ""}
            >
              <Dropdown.Menu show={rightClick}>
                <Dropdown.Item onClick={openModal}>
                  <FontAwesomeIcon
                    icon={faTrash}
                    style={{ color: "#515151", marginRight: "13px" }}
                  ></FontAwesomeIcon>
                  Remove
                </Dropdown.Item>

                <Dropdown.Item onClick={downloadHandler}>
                  <a id="tagID" href="" download=""></a>
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ color: "#515151", marginRight: "12px" }}
                  ></FontAwesomeIcon>
                  Download
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Toggle>
          </a>
        </Dropdown>

        <Modal show={open} onHide={closeModal}>
          <Form onSubmit={removeFileHandler}>
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
  } else {
    return (
      <>
        <Dropdown
          onContextMenu={
            activeContextMenu ? "" : (e) => contextMenuHandler(e, file.id)
          }
        >
          <a
            onDoubleClick={fileopenerhandler}
            className="btn"
            target="_blank"
            style={{ borderColor: "black" }}
          >
            <FontAwesomeIcon
              icon={faFile}
              style={{ marginRight: "8px" }}
              className="mr-5"
            ></FontAwesomeIcon>
            {file.name}

            <Dropdown.Toggle
              split
              variant="btn-light"
              style={{
                border: "none",
                paddingLeft: "20px",
                color: "white",
              }}
              className={open ? "bg-white" : ""}
            >
              <Dropdown.Menu show={rightClick}>
                <Dropdown.Item onClick={openModal}>
                  <FontAwesomeIcon
                    icon={faTrash}
                    style={{ color: "#515151", marginRight: "13px" }}
                  ></FontAwesomeIcon>
                  Remove
                </Dropdown.Item>

                <Dropdown.Item onClick={restoreFile}>
                  <a id="tagID" href="" download=""></a>
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ color: "#515151", marginRight: "12px" }}
                  ></FontAwesomeIcon>
                  Restore
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Toggle>
          </a>
        </Dropdown>

        <Modal show={open} onHide={closeModal}>
          <Form onSubmit={removeFileHandler}>
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
