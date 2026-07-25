import { useCallback, useEffect, useState } from "react";
import {
  createShipment,
  deleteShipment,
  getShipments,
  updateShipment,
} from "../../services/shipment.service";
import Pagination from "../../components/Pagination/Pagination";
import "./Shipments.css";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    origin: "",
    destination: "",
    search: "",
  });
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadShipments = useCallback(async (page = filters.page) => {
    try {
      setLoading(true);
      setError("");

      const response = await getShipments({
        page: Number(page),
        limit: Number(filters.limit),
        status: filters.status || undefined,
        origin: filters.origin || undefined,
        destination: filters.destination || undefined,
        search: filters.search || undefined,
      });

      setShipments(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(getShipmentError(err, "Unable to load shipments."));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    async function fetchShipments() {
      await loadShipments();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchShipments();
  }, [loadShipments]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    const normalizedValue = name === "limit" ? Number(value) : value;

    setFilters((current) => ({
      ...current,
      [name]: normalizedValue,
      page: name === "limit" ? 1 : current.page,
    }));
  }

  function handlePageChange(nextPage) {
    setFilters((current) => ({ ...current, page: nextPage }));
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
          <span>{pagination?.total ?? shipments.length}</span>
        </div>

        <div className="filter-bar">
          <label>
            Status
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Loaded">Loaded</option>
              <option value="InTransit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <label>
            Origin
            <input
              name="origin"
              value={filters.origin}
              onChange={handleFilterChange}
              placeholder="Origin"
            />
          </label>

          <label>
            Destination
            <input
              name="destination"
              value={filters.destination}
              onChange={handleFilterChange}
              placeholder="Destination"
            />
          </label>

          <label>
            Search
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Shipment #, customer, origin, destination"
            />
          </label>

          <label>
            Page size
            <select
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p>Loading shipments...</p>
        ) : shipments.length === 0 ? (
          <p>No shipments found.</p>
        ) : (
          <>
            <div className="shipment-list">
              {shipments.map((shipment) => (
                <article
                  className="shipment-row"
                  key={shipment.id}
                  onClick={() => navigate(`/shipments/${shipment.id}`)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(shipment);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="danger-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(shipment);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </section>
    </main>
  );
}

export default Shipments;
