import { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [allUploaded, setAllUploaded] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = () => {
    if (files.length === 0) {
      setMsg("No file chosen");
      return;
    }

    const newUploadProgress = {};
    files.forEach((file) => {
      newUploadProgress[file.name] = { progress: 0, uploaded: false };
    });
    setUploadProgress(newUploadProgress);
    setMsg("Uploading...");

    const uploadPromises = files.map((file) => {
      const fd = new FormData();
      fd.append("file", file);

      return axios
        .post("http://httpbin.org/post", fd, {
          onUploadProgress: (progressEvent) => {
            setUploadProgress((prevProgress) => ({
              ...prevProgress,
              [file.name]: {
                progress: (progressEvent.loaded / progressEvent.total) * 100,
                uploaded: false,
              },
            }));
          },
          headers: {
            "Custom-Header": "value",
          },
        })
        .then((res) => {
          setUploadProgress((prevProgress) => ({
            ...prevProgress,
            [file.name]: {
              progress: 100,
              uploaded: true,
            },
          }));
          return res.data;
        })
        .catch((err) => {
          setMsg("Upload failed");
          console.error(err);
        });
    });

    Promise.all(uploadPromises).then(() => {
      setAllUploaded(true);
      setMsg(
        files.length === 1
          ? "File uploaded successfully"
          : "All files uploaded successfully"
      );
    });
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...newFiles]);
    setAllUploaded(false);
    setMsg(null);
    const newUploadProgress = { ...uploadProgress };
    newFiles.forEach((file) => {
      newUploadProgress[file.name] = { progress: 0, uploaded: false };
    });
    setUploadProgress(newUploadProgress);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
    setAllUploaded(false);
    setMsg(null);
    const newUploadProgress = { ...uploadProgress };
    newFiles.forEach((file) => {
      newUploadProgress[file.name] = { progress: 0, uploaded: false };
    });
    setUploadProgress(newUploadProgress);
  };

  const handleClearSelection = () => {
    setFiles([]);
    setUploadProgress({});
    setAllUploaded(false);
    setMsg(null);
  };

  return (
    <div className="App">
      <h1 className="class1">Upload Here</h1>
      <form className="upload-form">
        <div
          className="file-drop-area"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            className="inp1"
            ref={fileInputRef}
            onChange={handleFileChange}
            type="file"
            multiple
            hidden
          />
          {files.length > 0 ? (
            <div>
              <p>{files.length} file(s) selected</p>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Drag & Drop files here or click to select</p>
          )}
        </div>
        <button
          className="btn"
          type="button"
          onClick={handleUpload}
          disabled={allUploaded}
        >
          {allUploaded ? "Uploaded" : "Upload"}
        </button>
        {allUploaded && (
          <button
            className="btn-add-more"
            type="button"
            onClick={() => fileInputRef.current.click()}
          >
            Add More Files
          </button>
        )}
        <button
          className="btn-clear"
          type="button"
          onClick={handleClearSelection}
        >
          Clear Selection
        </button>
      </form>
      {msg && <span>{msg}</span>}
      {files.length > 0 && (
        <ul className="progress-list">
          {files.map((file, index) => (
            <li key={index}>
              {file.name}: {uploadProgress[file.name]?.progress.toFixed(2)}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
