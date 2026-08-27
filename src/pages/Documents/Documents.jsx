import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { deleteDocument, downloadDocument, getDocuments, reviewDocument, submitDocument, uploadDocument } from "../../services/document.service";
import { getUser } from "../../services/auth.service";
import { getShipments } from "../../services/shipment.service";
import { getCargo } from "../../services/cargo.service";
import "./Documents.css";

const documentTypes = ["Bill of Lading", "Commercial Invoice", "Packing List", "Certificate of Origin", "Customs Declaration", "Insurance Certificate", "Other"];
const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "xlsx", "csv"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatStatus(status) {
  return String(status || "SUBMITTED").toLowerCase().replace(/(^|_)([a-z])/g, (_, prefix, letter) => `${prefix} ${letter.toUpperCase()}`).trim();
}

function Documents() {
  const user = getUser();
  const canManageDocuments = ["ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"].includes(user?.role);
  const canReviewDocuments = ["ADMIN", "COMPANY_ADMIN"].includes(user?.role);
  const isCompanyAdmin = user?.role === "COMPANY_ADMIN";
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedShipmentId = searchParams.get("shipmentId") || "";
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [cargoItems, setCargoItems] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("Bill of Lading");
  const [submissionStatus, setSubmissionStatus] = useState("SUBMITTED");
  const [shipmentId, setShipmentId] = useState(preselectedShipmentId);
  const [cargoId, setCargoId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [showUpload, setShowUpload] = useState(Boolean(preselectedShipmentId));
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    const response = await getDocuments(preselectedShipmentId ? { shipment_id: preselectedShipmentId } : {});
    setDocuments(Array.isArray(response.data) ? response.data : []);
  }, [preselectedShipmentId]);

  useEffect(() => {
    async function load() {
      try { setLoading(true); await loadDocuments(); }
      catch (requestError) { setError(requestError.response?.data?.error || "Unable to load documents."); }
      finally { setLoading(false); }
    }
    void load();
  }, [loadDocuments]);

  useEffect(() => {
    setShipmentId(preselectedShipmentId);
    if (preselectedShipmentId) setShowUpload(true);
  }, [preselectedShipmentId]);

  useEffect(() => {
    if (!canManageDocuments) return;
    getShipments({ page: 1, limit: 100 })
      .then((response) => setShipments(Array.isArray(response.data?.data) ? response.data.data : []))
      .catch(() => setError("Unable to load shipments for document upload."));
  }, [canManageDocuments]);

  useEffect(() => {
    if (!shipmentId || !canManageDocuments) return undefined;
    getCargo({ shipmentId: Number(shipmentId), page: 1, limit: 100 })
      .then((response) => setCargoItems(Array.isArray(response.data?.data) ? response.data.data : []))
      .catch(() => setCargoItems([]));
  }, [shipmentId, canManageDocuments]);

  const selectFile = (nextFile) => {
    if (!nextFile) return;
    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) return setError("Choose a PDF, Office spreadsheet/document, CSV, JPG, or PNG file.");
    if (nextFile.size > MAX_FILE_SIZE) return setError("Files must be 10 MB or smaller.");
    setError(""); setFile(nextFile);
  };

  const openUpload = () => { setError(""); setShowUpload(true); };
  const closeUpload = () => { setSearchParams({}); setShowUpload(false); setFile(null); setCargoId(""); setReferenceNumber(""); setExpiresAt(""); };

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) return setError("Choose a file to upload.");
    if (!shipmentId) return setError("Select the shipment this document belongs to.");
    try {
      setUploading(true); setUploadProgress(0); setError("");
      const formData = new FormData();
      formData.append("file", file); formData.append("type", type); formData.append("status", submissionStatus); formData.append("shipment_id", shipmentId);
      if (cargoId) formData.append("cargo_id", cargoId);
      if (referenceNumber.trim()) formData.append("reference_number", referenceNumber.trim());
      if (expiresAt) formData.append("expires_at", expiresAt);
      await uploadDocument(formData, (progressEvent) => {
        if (progressEvent.total) setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      });
      closeUpload(); await loadDocuments();
    } catch (requestError) { setError(requestError.response?.data?.error || "Unable to upload document."); }
    finally { setUploading(false); }
  }

  async function handleDownload(doc, preview = false) {
    try {
      const response = await downloadDocument(doc.id);
      const fallbackMimeType = /\.pdf$/i.test(doc.original_name)
        ? "application/pdf"
        : /\.png$/i.test(doc.original_name)
          ? "image/png"
          : /\.jpe?g$/i.test(doc.original_name)
            ? "image/jpeg"
            : "application/octet-stream";
      const mimeType = response.headers["content-type"] || fallbackMimeType;
      const url = URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      if (preview) window.open(url, "_blank", "noopener,noreferrer");
      else { const link = document.createElement("a"); link.href = url; link.download = doc.original_name; link.click(); }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { setError(preview ? "Unable to preview document." : "Unable to download document."); }
  }

  async function handleReview(id, status) {
    const reviewNote = window.prompt(status === "APPROVED" ? "Approval note (optional)" : "Reason for rejection (recommended)");
    if (reviewNote === null) return;
    try { await reviewDocument(id, { status, review_note: reviewNote }); await loadDocuments(); }
    catch (requestError) { setError(requestError.response?.data?.error || requestError.response?.data?.message || "Unable to review document."); }
  }

  async function handleSubmit(id) {
    try { await submitDocument(id); await loadDocuments(); }
    catch (requestError) { setError(requestError.response?.data?.error || "Unable to submit document."); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    try { await deleteDocument(id); await loadDocuments(); }
    catch (requestError) { setError(requestError.response?.data?.error || "Unable to delete document."); }
  }

  return <main className="documents-page">
    <section className="documents-header"><div><p className="eyebrow">ShipOps</p><h1>Documents</h1><p>{preselectedShipmentId ? `Shipment #${preselectedShipmentId} document workspace.` : "View shipment documents you are permitted to access."}</p></div>{canManageDocuments && !showUpload && <button type="button" onClick={openUpload}>Add document</button>}</section>
    {canManageDocuments && showUpload && <div className="document-upload-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeUpload(); }}>
      <section className="document-form-card" role="dialog" aria-modal="true" aria-labelledby="document-upload-title">
      <div className="form-card-heading"><div><p className="section-kicker">Shipment document</p><h2 id="document-upload-title">Add a document</h2><p>Attach this file to the shipment, or optionally to one cargo item.</p></div><button type="button" className="modal-close-button" onClick={closeUpload} aria-label="Close document upload form">×</button></div>
      <form className="document-form" onSubmit={handleUpload}>
        <label className={`upload-dropzone${dragging ? " is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}>
          <input ref={fileInputRef} type="file" accept={allowedExtensions.map((extension) => `.${extension}`).join(",")} onChange={(event) => selectFile(event.target.files[0])} />
          <span className="upload-dropzone-icon">⇧</span><strong>{file ? file.name : "Drop a file here or choose one"}</strong><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : "PDF, Office, CSV, JPG or PNG · up to 10 MB"}</small>
        </label>
        <label>Document type<select value={type} onChange={(event) => setType(event.target.value)}>{documentTypes.map((documentType) => <option key={documentType}>{documentType}</option>)}</select></label>
        {!isCompanyAdmin && <label>Save as<select value={submissionStatus} onChange={(event) => setSubmissionStatus(event.target.value)}><option value="SUBMITTED">Submitted for review</option><option value="DRAFT">Draft</option></select></label>}
        <label>Shipment<select value={shipmentId} onChange={(event) => setShipmentId(event.target.value)} required><option value="">Select a shipment</option>{shipments.map((shipment) => <option key={shipment.id} value={shipment.id}>{shipment.shipmentNumber} — {shipment.origin} to {shipment.destination}</option>)}</select></label>
        <label>Cargo item <span>(optional)</span><select value={cargoId} onChange={(event) => setCargoId(event.target.value)} disabled={!shipmentId}><option value="">Whole shipment</option>{cargoItems.map((cargo) => <option key={cargo.id} value={cargo.id}>{cargo.cargoName} · {cargo.cargoType}</option>)}</select></label>
        <label>Reference number <span>(optional)</span><input value={referenceNumber} maxLength="100" onChange={(event) => setReferenceNumber(event.target.value)} placeholder="e.g. BL-2026-00045" /></label>
        <label>Expiry date <span>(optional)</span><input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label>
        <div className="form-actions"><button disabled={uploading}>{uploading ? `Uploading${uploadProgress ? ` ${uploadProgress}%` : ""}...` : isCompanyAdmin ? "Upload and approve" : submissionStatus === "DRAFT" ? "Save draft" : "Upload and submit"}</button><span>{isCompanyAdmin ? "This file will be immediately available to your workspace." : submissionStatus === "DRAFT" ? "Drafts can be submitted when they are ready." : "Submitted files are ready for review."}</span></div>
      </form>
      </section>
    </div>}
    {error && <p className="error-message">{error}</p>}
    <section className="document-list-card">
      <div className="list-heading"><div><p className="section-kicker">Document library</p><h2>All documents</h2></div><span>{documents.length}</span></div>
      {loading ? <p>Loading documents...</p> : documents.length === 0 ? <div className="document-empty"><strong>No documents yet</strong><p>{canManageDocuments ? "Open a shipment and choose Manage shipment documents to upload the first file." : "Documents shared with your shipment will appear here."}</p></div> : <div className="document-list">{documents.map((doc) => {
        const status = doc.effective_status || doc.status || "SUBMITTED";
        const canPreview = /\.(pdf|png|jpe?g)$/i.test(doc.original_name);
        return <article className="document-row" key={doc.id}><div className="document-details"><div className="document-name-row"><h3>{doc.original_name}</h3><span className={`document-status ${status.toLowerCase()}`}>{formatStatus(status)}</span></div><p>{doc.type}{doc.reference_number ? ` · Ref: ${doc.reference_number}` : ""}</p><p>Uploaded {doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : "—"}{doc.uploaded_by ? ` · User #${doc.uploaded_by}` : ""}</p>{doc.cargo_id && <p>Linked cargo: #{doc.cargo_id}</p>}{doc.expires_at && <p className={status === "EXPIRED" ? "expired-date" : ""}>Expires: {new Date(doc.expires_at).toLocaleDateString()}</p>}{doc.review_note && <p className="review-note">Review note: {doc.review_note}</p>}</div><div className="row-actions">{canPreview && <button className="secondary-button" onClick={() => handleDownload(doc, true)}>Preview</button>}<button className="secondary-button" onClick={() => handleDownload(doc)}>Download</button>{canManageDocuments && status === "DRAFT" && <button className="approve-button" onClick={() => handleSubmit(doc.id)}>Submit</button>}{canReviewDocuments && status === "SUBMITTED" && <><button className="approve-button" onClick={() => handleReview(doc.id, "APPROVED")}>Approve</button><button className="reject-button" onClick={() => handleReview(doc.id, "REJECTED")}>Reject</button></>}{canManageDocuments && <button className="danger-button" onClick={() => handleDelete(doc.id)}>Delete</button>}</div></article>;
      })}</div>}
    </section>
  </main>;
}

export default Documents;
