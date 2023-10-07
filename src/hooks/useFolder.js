import { useEffect, useReducer } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firestore, database } from "../components/App";
import { useAuth } from "../contexts/AuthContext";
import { deleteObject, getStorage, ref } from "firebase/storage";

const ACTIONS = {
  SELECT_FOLDER: "select-folder",
  UPDATE_FOLDER: "update-folder",
  SET_CHILD_FOLDERS: "set-child-folders",
  SET_CHILD_FILES: "set-child-files",
  DELETE_FOLDER: "delete-folder",
  SET_RECYCLE_BIN_FOLDERS: "set-recyclebin-folders",
};
export const ROOT_FOLDER = { name: "Root", id: null, path: [] };

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.SELECT_FOLDER:
      return {
        folderId: payload.folderId,
        folder: payload.folder,
        childFiles: [],
        childFolders: [],
      };
    case ACTIONS.UPDATE_FOLDER:
      return {
        ...state,
        folder: payload.folder,
      };
    case ACTIONS.SET_CHILD_FOLDERS:
      return {
        ...state,
        childFolders: payload.childFolders,
      };
    case ACTIONS.SET_CHILD_FILES:
      return {
        ...state,
        childFiles: payload.childFiles,
      };
    case ACTIONS.DELETE_FOLDER:
      return {
        ...state,
        childFiles: payload.childFiles,
      };

    default:
      return state;
  }
}

export async function restoreFileHandler(
  file,
  currentUser,
  setFileDeletionDone
) {
  let file_data = null;
  //fetching Original Id of file in recycleBin
  try {
    const childFoldersquery = query(
      collection(firestore, "RecycleBinFile"),
      where("id", "==", file.id),
      where("userId", "==", currentUser.email)
    );

    const childFoldersSnapshot = await getDocs(childFoldersquery);

    childFoldersSnapshot.forEach(async (document) => {
      file_data = document.data();
      const reff = doc(firestore, "RecycleBinFile", document.id);
      await deleteDoc(reff);
      setFileDeletionDone(false);
    });
  } catch (error) {
    console.error("error while deleting permanenetly folder-", error);
  }

  //Set the doc back in Files collection
  const docRef = doc(firestore, "Files", file_data.id);

  setDoc(docRef, file)
    .then(() => {})
    .catch((error) => {
      console.log("Error while restoring file", error);
    });

  //   //delete the file from Recycle Bin
  //   const doc_ref = doc(firestore,"RecycleBinFile")
}

export async function restoreFolderHandler(
  folder,
  currentUser,
  setFolderDeletionDone
) {
  //fetching the folder from recycleBin
  let folder_data = null;
  const childFoldersQuery = query(
    collection(firestore, "RecycleBinFolder"),
    where("id", "==", folder.id),
    where("userId", "==", currentUser.email)
  );

  const childFoldersSnapshot = await getDocs(childFoldersQuery);
  childFoldersSnapshot.forEach(async (document) => {
    folder_data = document.data();
    const reff = doc(firestore, "RecycleBinFolder", document.id);
    await deleteDoc(reff);
    setFolderDeletionDone(false);
  });

  //Set the doc back in Folders collection
  const docRef = doc(firestore, "Folders", folder_data.id);

  setDoc(docRef, folder)
    .then(() => {})
    .catch((error) => {
      console.log("Error while restoring file", error);
    });
}

export async function removeFolder(folder) {
  //adding it into recycleBin
  try {
    const a = await addDoc(collection(firestore, "RecycleBinFolder"), folder);
  } catch (error) {
    console.error("Error while adding folder to recyclde bin-", error);
  }

  //for deleting itself
  try {
    const folder_ref = doc(firestore, "Folders", folder.id);
    const a = await deleteDoc(folder_ref);
  } catch (error) {
    console.error("error while deleting permanenetly folder-", error);
  }
}

export async function permanentlyRemoveFolder(
  folder,
  currentUser,
  setFolderDeletionDone
) {
  let parent = null;

  //for deleting itself
  try {
    const childFoldersquery = query(
      collection(firestore, "RecycleBinFolder"),
      where("id", "==", folder.id),
      where("userId", "==", currentUser.email)
    );

    const childFoldersSnapshot = await getDocs(childFoldersquery);

    childFoldersSnapshot.forEach(async (doc) => {
      parent = doc.data();
      await deleteDoc(doc.ref);

      setFolderDeletionDone(false);
    });
  } catch (error) {
    console.error("error while deleting permanenetly folder-", error);
  }

  // for deleting its child files from collection as well as from storage
  try {
    const childFilesquery = query(
      collection(firestore, "Files"),
      // where("folderId", "==", parent.id),
      where("userId", "==", currentUser.email)
    );

    const childFilesSnapshot = await getDocs(childFilesquery);

    childFilesSnapshot.forEach(async (docu) => {
      //from the storage
      const storage = getStorage();
      let file = docu;
      let file_data = docu.data();

      if (file_data.folderId) {
        const childFoldersquery = query(
          collection(firestore, "Folders"),
          where("userId", "==", currentUser.email)
        );

        const childFoldersSnapshot = await getDocs(childFoldersquery);
        childFoldersSnapshot.forEach(async (document) => {
          let path = document.data().path;
          if (document.id == file_data.folderId) {
            if (path.length > 0) {
              path.forEach(async (f) => {
                if (f.id == parent.id) {
                  try {
                    await deleteDoc(file.ref);
                  } catch (error) {
                    console.log("error   khtrnakaaa-", error);
                  }

                  //to delete the file from storage
                  const names = path.map((obj) => obj.name);
                  const a = names.join("/");
                  let file_reference = ref(
                    storage,
                    `/files/${currentUser.email}/${a}/${document.data().name}/${
                      file_data.name
                    }`
                  );

                  deleteObject(file_reference)
                    .then(() => {})
                    .catch((error) => {
                      console.log("Couldnt delete from storage", error);
                    });
                }
              });
            }
          }
        });
      }
      setFolderDeletionDone(false);
    });
  } catch (error) {
    console.error("error while deleting permanently file-", error);
  }

  //check whether deleted folder has some files
  const f = doc(firestore, "Folders", parent.id);

  try {
    const folder_details = await getDoc(f);

    //if the folder is deletd , the immediate subfile needs to be deleted too
    if (!folder_details.exists()) {
      try {
        const childFilesquery = query(
          collection(firestore, "Files"),
          where("folderId", "==", parent.id),
          where("userId", "==", currentUser.email)
        );

        const childFilesSnapshot = await getDocs(childFilesquery);
        const storage = getStorage();
        childFilesSnapshot.forEach(async (file) => {
          //delete from collections
          await deleteDoc(file.ref);

          const data = file.data();
          //to delete the file from storage
          let names = null;
          let file_reference = null;
          if (data.path != null) {
            names = data.path.map((obj) => obj.name);
            const a = names.join("/");
            file_reference = ref(
              storage,
              `/files/${currentUser.email}/${a}/${parent.name}/${data.name}`
            );
          } else {
            file_reference = ref(
              storage,
              `/files/${currentUser.email}/${parent.name}/${data.name}`
            );
          }

          deleteObject(file_reference)
            .then(() => {})
            .catch((error) => {
              console.log("Couldnt delete from storage", error);
            });
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("not foundddddddddddddddddx");
    }
  } catch (error) {
    console.log(error);
  }

  // for deleting its child folders
  try {
    const childFoldersquery = query(
      collection(firestore, "Folders"),
      //where("parentId", "==", parent.id),
      where("userId", "==", currentUser.email)
    );

    const childFoldersSnapshot = await getDocs(childFoldersquery);

    childFoldersSnapshot.forEach(async (doc) => {
      let path = doc.data().path;

      //to delete all the subfolders present

      //folder is not rootfolder
      if (path.length > 0) {
        path.forEach(async (f) => {
          if (f.id == parent.id) {
            await deleteDoc(doc.ref);

            //to delete file from storage
          }
        });
      }

      setFolderDeletionDone(false);
    });
  } catch (error) {
    console.error("error while deleting permanenetly folder-", error);
  }
}

export async function removeFile(file, currentUser) {
  try {
    //adding this file in recycle bin
    try {
      const a = await addDoc(collection(firestore, "RecycleBinFile"), file);
    } catch (error) {
      console.error("Error while adding file to recycle bin", error);
    }

    // to delete itself
    const file_ref = doc(firestore, "Files", file.id);
    await deleteDoc(file_ref);
  } catch (error) {
    console.error("Error while deleting file-", error);
  }
}

export async function permanentlyRemoveFile(
  file,
  currentUser,
  setFileDeletionDone
) {
  const storage = getStorage();
  if (!file.folderId) {
    //file was in root folder
    const file_ref = ref(storage, `/files/${currentUser.email}/${file.name}`);

    //null or it has value
    deleteObject(file_ref)
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });
  } else {
    //file is not in rootfolder
    //step1 fetch the folder

    const f = doc(firestore, "Folders", file.folderId);

    try {
      const folder_details = await getDoc(f);

      if (folder_details.exists()) {
        const d = folder_details.data();
        const arr = d.path;
        let a = "";
        if (arr.length > 0) {
          const names = arr.forEach((obj) => obj.name);
          a = names.join("/");
        }

        //to delete it finally
        const final_ref = ref(
          storage,
          `/files/${currentUser.email}/${a}/${d.name}/${file.name}`
        );

        deleteObject(final_ref)
          .then(() => {})
          .catch((error) => {
            console.error(error);
          });
      }
    } catch (error) {
      console.error(error);
    }
  }

  // to delete itself from collection recycleBinFIle
  try {
    const childFoldersquery = query(
      collection(firestore, "RecycleBinFile"),
      where("id", "==", file.id),
      where("userId", "==", currentUser.email)
    );

    const childFoldersSnapshot = await getDocs(childFoldersquery);

    childFoldersSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);

      setFileDeletionDone(false);
    });
  } catch (error) {
    console.error("error while deleting permanenetly folder-", error);
  }
}

export function useFolder(folderId = null, folder = null) {
  const { currentUser } = useAuth();

  const [state, dispatch] = useReducer(reducer, {
    folderId,
    folder,
    childFolders: [],
    childFiles: [],
  });

  useEffect(() => {
    async function fetchFolder() {
      if (folderId == null) {
        dispatch({
          type: ACTIONS.UPDATE_FOLDER,
          payload: { folder: ROOT_FOLDER },
        });
        return;
      }

      try {
        const folderRef = doc(firestore, "Folders", folderId);
        const folderDoc = await getDoc(folderRef);

        if (folderDoc.exists()) {
          dispatch({
            type: ACTIONS.UPDATE_FOLDER,
            payload: { folder: database.formatDoc(folderDoc) },
          });
        } else {
          dispatch({
            type: ACTIONS.UPDATE_FOLDER,
            payload: { folder: ROOT_FOLDER },
          });
        }
      } catch (error) {
        console.error("Error fetching folder:", error);
        dispatch({
          type: ACTIONS.UPDATE_FOLDER,
          payload: { folder: ROOT_FOLDER },
        });
      }
    }

    fetchFolder();
  }, [folderId]);

  useEffect(() => {
    const q = query(
      collection(firestore, "Folders"),
      where("parentId", "==", folderId),
      where("userId", "==", currentUser.email),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const childFolders = [];

      querySnapshot.forEach((doc) => {
        childFolders.push(database.formatDoc(doc));
      });

      dispatch({
        type: ACTIONS.SET_CHILD_FOLDERS,
        payload: { childFolders: childFolders },
      });
    });

    return () => {
      unsubscribe(); // Cleanup by unsubscribing from the snapshot listener
    };
  }, [folderId, currentUser]);

  useEffect(() => {
    const q = query(
      collection(firestore, "Files"),
      where("folderId", "==", folderId),
      where("userId", "==", currentUser.email),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const childFolders = [];

      querySnapshot.forEach((doc) => {
        childFolders.push(database.formatDoc(doc));
      });

      dispatch({
        type: ACTIONS.SET_CHILD_FILES,
        payload: { childFiles: childFolders },
      });
    });

    return () => {
      unsubscribe(); // Cleanup by unsubscribing from the snapshot listener
    };
  }, [folderId, currentUser]);

  return state;
}
