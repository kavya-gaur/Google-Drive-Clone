import { faRecycle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";

export default function AddRecycleBinButton() {
  const navigate = useNavigate();
  return (
    <Button
      className="ml-2"
      onClick={() => navigate("/recyclebin")}
      variant="outline-success"
      size="sm"
      style={{ marginLeft: "10px", marginRight: "10px" }}
    >
      <FontAwesomeIcon
        style={{ height: "23px", width: "23px" }}
        icon={faRecycle}
      />
    </Button>
  );
}
