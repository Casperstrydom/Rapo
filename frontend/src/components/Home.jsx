import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Home.css";

function FileUpload({
  label,
  onFileUploaded,
  documentType,
  onDelete,
  isUploaded,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFolderUpload = (e) => {
    const files = Array.from(e.target.files);

    // Handle empty folder case
    if (files.length === 0) {
      handleUpload([]);
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 1024 * 1024 * 1024) {
      // 1GB max
      alert("Total folder size too large (max 1GB)");
      return;
    }

    handleUpload(files);
  };

  const handleUpload = async (files) => {
    const formData = new FormData();

    // Handle empty folder case
    if (files.length === 0) {
      formData.append("emptyFolder", "true");
      formData.append("folderName", label);
    } else {
      files.forEach((file) => {
        const relativePath = file.webkitRelativePath || file.name;
        formData.append("files", file, relativePath);
      });
    }

    formData.append("documentType", documentType);
    formData.append("folderName", label);

    try {
      setIsUploading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/home/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert(`✅ ${label} uploaded successfully`);
      if (onFileUploaded) onFileUploaded(label);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "❌ Failed to upload folder.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm(`Are you sure you want to delete ${label}?`)) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/home/delete-document",
        { documentType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (onDelete) onDelete(label);
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "❌ Failed to delete document.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="file-upload-container">
      <label
        className={`custum-file-upload ${isUploaded ? "uploaded" : ""}`}
        style={{ opacity: isUploading ? 0.7 : 1 }}
      >
        <div className="text">
          <span>{label}</span>
          {isUploading ? (
            <div className="loading-spinner-small"></div>
          ) : isUploaded ? (
            <span className="upload-success">✓</span>
          ) : null}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFolderUpload}
          disabled={isUploading || isUploaded}
          webkitdirectory="true"
          directory="true"
          multiple
        />
      </label>
      <button
        className="delete-btn"
        onClick={handleDeleteClick}
        title={`Delete ${label}`}
        disabled={isDeleting || !isUploaded}
      >
        {isDeleting ? (
          <div className="loading-spinner-small"></div>
        ) : (
          "🗑️ Delete"
        )}
      </button>
    </div>
  );
}

function SatisfactionCertificate({ user, onClose, isPublicView = false }) {
  return (
    <div className="certificate-overlay">
      <div className="certificate-container">
        <button className="close-certificate" onClick={onClose}>
          &times;
        </button>

        {!isPublicView ? (
          <>
            <div className="certificate-header">
              <h2>Affidavit Testimony of My Status</h2>
            </div>
            <div className="certificate-body">
              <div className="affidavit-statement">
                <p>
                  I, a living soul being of sound mind, competent and over the
                  age of maturity, hereby affirm the following testimony is
                  true. I have completed the fullness of the sovereign walk.
                </p>
              </div>
              <div className="certificate-scroll-container">
                <div className="completed-documents-section">
                  <h3>Completed Documents:</h3>

                  {user.documentRequirements?.politicalDeclaration && (
                    <div className="document-group">
                      <h4>
                        528 - Universal Public Declaration of Political Status:
                      </h4>
                      <div className="document-details">
                        <h5>
                          Witness Testimony Affirming Political Status &
                          Identity
                        </h5>
                        <h5>Id-Document/Drivers-License/Passport</h5>
                        <h5>Photo With White Background</h5>
                        <h5>Thumb-Print (Red Ink)</h5>
                        <h5>Utility Bill</h5>
                        <p className="upload-status">✅ Documents Uploaded</p>
                      </div>
                    </div>
                  )}

                  {user.documentRequirements?.witnessTestimonies?.length >
                    0 && (
                    <div className="document-group">
                      <h4>
                        928 - Acknowledgement, Acceptance and Deed of
                        Re-Conveyance:
                      </h4>
                      <div className="document-details">
                        <h5>Certificate of Assumed Name</h5>
                        <h5>Notice of Transfer of Reserved Name</h5>
                        <h5>Act of Expatriation</h5>
                        <h5>Cancellation of all Prior Powers of Attorney</h5>
                        <h5>Paramount Claim of Life</h5>
                        <h5>Mandatory Notice - Notice of Liability</h5>
                        <h5>Baby Deed</h5>
                        <h5>
                          Solemn Record and Proclamation of Lawful Marriage
                        </h5>
                        <h5>Affidavit Testimony</h5>
                        <p className="upload-status">
                          ✅{" "}
                          {user.documentRequirements.witnessTestimonies.length}{" "}
                          testimonies uploaded
                        </p>
                      </div>
                    </div>
                  )}

                  {user.documentRequirements?.idDocumentFile && (
                    <div className="document-group">
                      <h4>Praecipe:</h4>
                      <div className="document-details">
                        <p className="upload-status">✅ Documents Uploaded</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="signature-section">
                <div className="signature-line"></div>
                <p className="signature-name">
                  {user.fullNames} {user.familyName}
                </p>
                <p className="signature-date">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="public-certificate-view">
            <div className="certificate-header">
              <h2>Certificate of Completion</h2>
            </div>
            <div className="certificate-body">
              <div className="affidavit-statement">
                <p>
                  This is to certify that {user.fullNames} {user.familyName} has
                  successfully completed all required documentation for
                  sovereign status.
                </p>
              </div>
              <div className="signature-section">
                <div className="signature-line"></div>
                <p className="signature-name">
                  {user.fullNames} {user.familyName}
                </p>
                <p className="signature-date">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedLabels, setUploadedLabels] = useState([]);
  const [userData, setUserData] = useState({
    fullNames: "Loading...",
    familyName: "",
    email: "Loading...",
    documentRequirements: {},
  });
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [publicViewUsers, setPublicViewUsers] = useState([]);
  const [showPublicView, setShowPublicView] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [loadingPublicView, setLoadingPublicView] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoadingUserData(true);
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = {
        fullNames: response.data.fullNames || response.data.name || "Unknown",
        familyName: response.data.familyName || "",
        email: response.data.email || "No email",
        documentRequirements: response.data.documentRequirements || {},
      };

      setUserData(userData);
      setTempName(`${userData.fullNames} ${userData.familyName}`);
      setTempEmail(userData.email);

      // Update uploaded labels based on document requirements
      const uploaded = [];
      if (userData.documentRequirements?.politicalDeclaration)
        uploaded.push("528");
      if (userData.documentRequirements?.witnessTestimonies?.length > 0)
        uploaded.push("928");
      if (userData.documentRequirements?.idDocumentFile)
        uploaded.push("Praecipe");

      setUploadedLabels(uploaded);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      localStorage.removeItem("token");
      window.location.href = "/login";
    } finally {
      setLoadingUserData(false);
    }
  };

  const fetchPublicViewUsers = async () => {
    try {
      setLoadingPublicView(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/home/public-view",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPublicViewUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch public view users:", error);
    } finally {
      setLoadingPublicView(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (showPublicView) {
      fetchPublicViewUsers();
    }
  }, [showPublicView]);

  const saveUserData = async () => {
    if (!tempName.trim() || !tempEmail.trim()) {
      alert("Name and email cannot be empty");
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const [fullNames, ...familyNameParts] = tempName.split(" ");
      const familyName = familyNameParts.join(" ");

      if (!familyName) {
        alert("Please provide both first and last names");
        return;
      }

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/auth/update",
        {
          fullNames,
          familyName,
          email: tempEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUserData = {
        ...userData,
        fullNames,
        familyName,
        email: tempEmail,
      };

      setUserData(updatedUserData);
      setTempName(`${fullNames} ${familyName}`);
      setTempEmail(tempEmail);

      setEditingName(false);
      setEditingEmail(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleFileUploaded = (label) => {
    if (!uploadedLabels.includes(label)) {
      setUploadedLabels([...uploadedLabels, label]);
    }
    fetchUserData(); // Refresh user data to get latest document status
  };

  const handleFileDeleted = (label) => {
    setUploadedLabels(uploadedLabels.filter((l) => l !== label));
    fetchUserData(); // Refresh user data to get latest document status
  };

  const hasCompletedAllDocuments =
    userData.documentRequirements?.politicalDeclaration &&
    userData.documentRequirements?.witnessTestimonies?.length > 0 &&
    userData.documentRequirements?.idDocumentFile;

  return (
    <>
      <div
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {userData.fullNames.charAt(0).toUpperCase()}
      </div>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="back-btn" onClick={() => setSidebarOpen(false)}>
          &larr; Back
        </button>
        <h2>User Info</h2>

        {loadingUserData ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading user data...</p>
          </div>
        ) : (
          <>
            <div className="editable-field">
              <label>Name:</label>
              {editingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  autoFocus
                />
              ) : (
                <span>{tempName}</span>
              )}
              {!editingName && (
                <button
                  className="edit-btn"
                  onClick={() => setEditingName(true)}
                >
                  ✏️
                </button>
              )}
            </div>

            <div className="editable-field">
              <label>Email:</label>
              {editingEmail ? (
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  autoFocus
                />
              ) : (
                <span>{tempEmail}</span>
              )}
              {!editingEmail && (
                <button
                  className="edit-btn"
                  onClick={() => setEditingEmail(true)}
                >
                  ✏️
                </button>
              )}
            </div>

            {(editingName || editingEmail) && (
              <div className="save-section">
                <button
                  className="save-btn"
                  onClick={saveUserData}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <div className="loading-spinner-small"></div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditingName(false);
                    setEditingEmail(false);
                    setTempName(`${userData.fullNames} ${userData.familyName}`);
                    setTempEmail(userData.email);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="document-uploads">
              <h3>Document Uploads</h3>
              <FileUpload
                label="528"
                documentType="politicalDeclaration"
                onFileUploaded={handleFileUploaded}
                onDelete={handleFileDeleted}
                isUploaded={
                  !!userData.documentRequirements?.politicalDeclaration
                }
              />
              <FileUpload
                label="928"
                documentType="witnessTestimonies"
                onFileUploaded={handleFileUploaded}
                onDelete={handleFileDeleted}
                isUploaded={
                  userData.documentRequirements?.witnessTestimonies?.length > 0
                }
              />
              <FileUpload
                label="Praecipe"
                documentType="idDocument"
                onFileUploaded={handleFileUploaded}
                onDelete={handleFileDeleted}
                isUploaded={!!userData.documentRequirements?.idDocumentFile}
              />
            </div>

            {hasCompletedAllDocuments && (
              <div className="certificate-section">
                <button
                  className="view-certificate-btn"
                  onClick={() => setShowCertificate(true)}
                >
                  View My Certificate
                </button>
              </div>
            )}

            <div className="logout-section">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>

      <div className={`home-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="main-content">
          {loadingUserData ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your data...</p>
            </div>
          ) : (
            <>
              <h2>
                Welcome, {userData.fullNames} {userData.familyName}
              </h2>

              <button
                className="public-view-btn"
                onClick={() => setShowPublicView(!showPublicView)}
              >
                {showPublicView ? "Hide Public View" : "Show Public View"}
              </button>

              {showPublicView ? (
                <div className="public-view-container">
                  <h3>Users with Completed Documents</h3>
                  {loadingPublicView ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading public records...</p>
                    </div>
                  ) : publicViewUsers.length === 0 ? (
                    <p>No users have completed all documents yet</p>
                  ) : (
                    <div className="completed-users-scroll-container">
                      <div className="completed-users-list">
                        {publicViewUsers.map((user) => (
                          <div
                            key={user._id}
                            className="completed-user"
                            onClick={() => setSelectedUser(user)}
                          >
                            <div className="user-info">
                              <span>
                                {user.fullNames} {user.familyName}
                              </span>
                            </div>
                            <span className="completed-badge">
                              View Certificate
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="dashboard-info">
                  <div className="completion-status">
                    <h4>Your Document Completion:</h4>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(uploadedLabels.length / 3) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p>
                      {hasCompletedAllDocuments ? (
                        <span className="completed-text">
                          ✅ All documents completed! You can now view your
                          certificate.
                        </span>
                      ) : (
                        `${uploadedLabels.length} of 3 documents uploaded`
                      )}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedUser && (
        <SatisfactionCertificate
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          isPublicView={true}
        />
      )}

      {showCertificate && (
        <SatisfactionCertificate
          user={userData}
          onClose={() => setShowCertificate(false)}
          isPublicView={false}
        />
      )}
    </>
  );
}
