import { useEffect, useState } from "react";
import {
  createShipment,
  deleteShipment,
  getShipments,
  updateShipment,
} from "../../services/shipment.service";
import "./Shipments.css";

const emptyForm = {
  shipmentNumber: "",
  shipId: "",
  customerName: "",
  origin: "",
  destination: "",
  departureDate: "",
  arrivalDate: "",
  status: "Pending",
};

function getShipmentError(error, fallbackMessage) {
  return (
    error.response?.data?.errors?.[0]?.msg
    || error.response?.data?.message
    || error.response?.data?.error
    || fallbackMessage
  );
}

function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadShipments();
  }, []);

  async function loadShipments() {
    try {
      setLoading(true);
      setError("");

      const response = await getShipments();

      setShipments(response.data.data);
    } catch (err) {
      setError(getShipmentError(err, "Unable to load shipments."));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        ...form,
        shipId: Number(form.shipId),
      };

      if (editingId) {
        await updateShipment(editingId, payload);
      } else {
        await createShipment(payload);
      }

      resetForm();
      await loadShipments();
    } catch (err) {
      setError(getShipmentError(err, "Unable to save shipment."));
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(shipment) {
    setEditingId(shipment.id);

    setForm({
      shipmentNumber: shipment.shipmentNumber,
      shipId: shipment.shipId,
      customerName: shipment.customerName,
      origin: shipment.origin,
      destination: shipment.destination,
      departureDate: shipment.departureDate.slice(0, 10),
      arrivalDate: shipment.arrivalDate.slice(0, 10),
      status: shipment.status,
    });

    setError("");
  }

  async function handleDelete(shipment) {
    if (!window.confirm(`Delete shipment ${shipment.shipmentNumber}?`))
      return;

    try {
      await deleteShipment(shipment.id);

      if (editingId === shipment.id) {
        resetForm();
      }

      await loadShipments();
    } catch (err) {
      setError(getShipmentError(err, "Unable to delete shipment."));
    }
  }

  return (
    <main className="shipments-page">
      <section className="shipments-header">
        <div>
          <p className="eyebrow">ShipOps</p>
          <h1>Shipments</h1>
          <p>Manage all shipments in the system.</p>
        </div>
      </section>

      <section className="shipment-form-card">
        <h2>{editingId ? "Edit Shipment" : "Create Shipment"}</h2>

        <form onSubmit={handleSubmit} className="shipment-form">

          <label>
            Shipment Number
            <input
              name="shipmentNumber"
              value={form.shipmentNumber}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Ship ID
            <input
              type="number"
              name="shipId"
              value={form.shipId}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Customer
            <input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Origin
            <input
              name="origin"
              value={form.origin}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Destination
            <input
              name="destination"
              value={form.destination}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Departure Date
            <input
              type="date"
              name="departureDate"
              value={form.departureDate}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Arrival Date
            <input
              type="date"
              name="arrivalDate"
              value={form.arrivalDate}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>Loaded</option>
              <option value="InTransit">In Transit</option>
              <option>Delivered</option>
              <option>Delayed</option>
              <option>Cancelled</option>
            </select>
          </label>

          <div className="form-actions full-width">
            <button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Create Shipment"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      </section>

      {error && <p className="error-message">{error}</p>}

      <section className="shipment-list-card">

        <div className="list-heading">
          <h2>All Shipments</h2>
          <span>{shipments.length}</span>
        </div>

        {loading ? (
          <p>Loading shipments...</p>
        ) : shipments.length === 0 ? (
          <p>No shipments found.</p>
        ) : (
          <div className="shipment-list">

            {shipments.map((shipment) => (
              <article
                className="shipment-row"
                key={shipment.id}
              >
                <div>
                  <h3>{shipment.shipmentNumber}</h3>

                  <p>
                    {shipment.origin} → {shipment.destination}
                  </p>

                  <p>
                    Customer: {shipment.customerName}
                  </p>

                  <p>
                    Status: <strong>{shipment.status}</strong>
                  </p>
                </div>

                <div className="row-actions">

                  <button
                    className="secondary-button"
                    onClick={() => handleEdit(shipment)}
                  >
                    Edit
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => handleDelete(shipment)}
                  >
                    Delete
                  </button>

                </div>
              </article>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}

export default Shipments;
