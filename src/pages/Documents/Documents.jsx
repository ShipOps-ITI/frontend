import { useEffect, useState } from "react";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from "../../services/document.service";
import "./Documents.css";
import { getUser } from "../../services/auth.service";
import { getShipments } from "../../services/shipment.service";


function Documents() {
  const canManageDocuments = ["ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"].includes(getUser()?.role);

  const [documents, setDocuments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("Invoice");
  const [shipmentId, setShipmentId] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);


  useEffect(() => {
    loadDocuments();
    if (canManageDocuments) loadShipments();
  }, []);


  async function loadDocuments() {
    try {

      setLoading(true);

      const response = await getDocuments();

      setDocuments(response.data);

    } catch (err) {

      console.error(err);
      setError("Unable to load documents.");

    } finally {

      setLoading(false);

    }
  }

  async function loadShipments() {
    try {
      const response = await getShipments({ page: 1, limit: 100 });
      setShipments(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load shipments for document upload.");
    }
  }


  async function handleUpload(event) {

    event.preventDefault();

    if (!file) {
      setError("Please select a file.");
      return;
    }

    if (!shipmentId) {
      setError("Please select the shipment this document belongs to.");
      return;
    }


    try {

      setUploading(true);
      setError("");

      const formData = new FormData();

      formData.append("file", file);
      formData.append("type", type);

      formData.append("shipment_id", shipmentId);


      await uploadDocument(formData);


      setFile(null);
      setShipmentId("");
      setShowUploadForm(false);

      document
        .getElementById("document-file")
        .value = "";


      await loadDocuments();


    } catch (err) {

      console.error(err);
      setError(
        err.response?.data?.error ||
        "Unable to upload document."
      );

    } finally {

      setUploading(false);

    }

  }


  async function handleDelete(id) {

    if (!window.confirm("Delete this document?")) {
      return;
    }


    try {

      await deleteDocument(id);

      await loadDocuments();

    } catch (err) {

      setError("Unable to delete document.");

    }

  }


  async function handleDownload(doc) {

    try {

      const response = await downloadDocument(doc.id);


      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );


      const link = document.createElement("a");

      link.href = url;
      link.download = doc.original_name;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);


    } catch (err) {

      setError("Unable to download document.");

    }

  }



  return (

    <main className="documents-page">


      <section className="documents-header">

        <div>

          <p className="eyebrow">
            ShipOps
          </p>

          <h1>
            Documents
          </h1>

          <p>
            Manage shipment documents and files.
          </p>

        </div>

        {canManageDocuments && (
          <button type="button" onClick={() => { setError(""); setShowUploadForm(true); }}>
            Upload document
          </button>
        )}

      </section>



      {canManageDocuments && showUploadForm && <section className="document-form-card">

        <div className="form-card-heading">
          <div><h2>Upload a document</h2><p>Attach a file to one of your accessible shipments.</p></div>
          <button type="button" className="secondary-button" onClick={() => setShowUploadForm(false)}>Close</button>
        </div>


        <form
          className="document-form"
          onSubmit={handleUpload}
        >


          <label>
            File

            <input
              id="document-file"
              type="file"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
            />

          </label>



          <label>

            Document Type

            <select
              value={type}
              onChange={(e)=>
                setType(e.target.value)
              }
            >

              <option>
                Invoice
              </option>

              <option>
                Bill of Lading
              </option>

              <option>
                Packing List
              </option>

              <option>
                Customs Document
              </option>

            </select>

          </label>



          <label>

            Shipment

            <select
              value={shipmentId}
              onChange={(e)=>
                setShipmentId(e.target.value)
              }
              required
            >
              <option value="">Select a shipment</option>
              {shipments.map((shipment) => (
                <option key={shipment.id} value={shipment.id}>
                  {shipment.shipmentNumber} — {shipment.origin} to {shipment.destination}
                </option>
              ))}
            </select>

          </label>



          <div className="form-actions">

            <button disabled={uploading}>

              {
                uploading
                ? "Uploading..."
                : "Upload document"
              }

            </button>

          </div>


        </form>


      </section>}



      {error && (
        <p className="error-message">
          {error}
        </p>
      )}




      <section className="document-list-card">


        <div className="list-heading">

          <div><p className="section-kicker">Document library</p><h2>All documents</h2></div>

          <span>
            {documents.length}
          </span>

        </div>



        {
          loading ?

          <p>
            Loading documents...
          </p>


          :

          documents.length === 0 ?

          <p>
            No documents yet. Upload the first file for one of your shipments.
          </p>


          :

          <div className="document-list">


          {
            documents.map((doc)=>(


              <article
                className="document-row"
                key={doc.id}
              >


                <div>

                  <h3>
                    {doc.original_name}
                  </h3>


                  <p>
                    Type: {doc.type}
                  </p>


                  <p>
                    Uploaded:
                    {" "}
                    {new Date(
                      doc.upload_date
                    ).toLocaleDateString()}
                  </p>


                </div>



                <div className="row-actions">


                  <button
                    className="secondary-button"
                    onClick={() =>
                      handleDownload(doc)
                    }
                  >
                    Download
                  </button>



                  {canManageDocuments && <button
                    className="danger-button"
                    onClick={() =>
                      handleDelete(doc.id)
                    }
                  >
                    Delete
                  </button>}


                </div>


              </article>


            ))
          }


          </div>

        }


      </section>



    </main>

  );

}


export default Documents;
