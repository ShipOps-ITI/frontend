import { useEffect, useState } from "react";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from "../../services/document.service";
import "./Documents.css";


function Documents() {

  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("Invoice");
  const [shipmentId, setShipmentId] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    loadDocuments();
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


  async function handleUpload(event) {

    event.preventDefault();

    if (!file) {
      setError("Please select a file.");
      return;
    }


    try {

      setUploading(true);
      setError("");

      const formData = new FormData();

      formData.append("file", file);
      formData.append("type", type);

      if (shipmentId) {
        formData.append("shipment_id", shipmentId);
      }


      await uploadDocument(formData);


      setFile(null);
      setShipmentId("");

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

      </section>



      <section className="document-form-card">

        <h2>
          Upload Document
        </h2>


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

            Shipment ID (optional)

            <input
              type="number"
              value={shipmentId}
              onChange={(e)=>
                setShipmentId(e.target.value)
              }
            />

          </label>



          <div className="form-actions">

            <button disabled={uploading}>

              {
                uploading
                ? "Uploading..."
                : "Upload"
              }

            </button>

          </div>


        </form>


      </section>



      {error && (
        <p className="error-message">
          {error}
        </p>
      )}




      <section className="document-list-card">


        <div className="list-heading">

          <h2>
            All Documents
          </h2>

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
            No documents found.
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



                  <button
                    className="danger-button"
                    onClick={() =>
                      handleDelete(doc.id)
                    }
                  >
                    Delete
                  </button>


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