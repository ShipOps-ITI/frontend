import { useCallback, useEffect, useState } from "react";
import {
  createShipment,
  deleteShipment,
  getShipments,
  updateShipment,
} from "../../services/shipment.service";
import Pagination from "../../components/Pagination/Pagination";
import { getUser } from "../../services/auth.service";
import { getCompanies } from "../../services/company.service";
import { getShips, getShipsByCompany } from "../../services/ship.service";
import { getPorts } from "../../services/port.service";
import { getCustomers } from "../../services/users.service";
import "./Shipments.css";
import { useNavigate } from "react-router-dom";

const emptyForm = {
  companyId: "",
  shipmentNumber: "",
  shipId: "",
  customerName: "",
  customerUserId: "",
  originPortId: "",
  destinationPortId: "",
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
  const user = getUser();
  const isAdmin = user?.role === "ADMIN";
  const canManageShipments = ["ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"].includes(user?.role);
  const [shipments, setShipments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [ships, setShips] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [originPorts, setOriginPorts] = useState([]);
  const [destinationPorts, setDestinationPorts] = useState([]);
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
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
  const [portSearchError, setPortSearchError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [shipmentPendingDelete, setShipmentPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.origin || filters.destination,
  );

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

    fetchShipments();
  }, [loadShipments]);

  useEffect(() => {
    if (!canManageShipments) return;

    async function loadReferences() {
      try {
        const [companyResponse, shipResponse, customerResponse] = await Promise.all([
          getCompanies(1, 100),
          getShips(1, 100),
          getCustomers(),
        ]);
        setCompanies(companyResponse.data.data);
        setShips(shipResponse.data.data);
        setCustomers(customerResponse.data);
      } catch (requestError) {
        setError(getShipmentError(requestError, "Unable to load shipment reference data."));
      }
    }
    loadReferences();
  }, [canManageShipments]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (originSearch.trim().length < 2) return setOriginPorts([]);
      try {
        const response = await getPorts(1, 25, originSearch);
        setOriginPorts(response.data.data);
        setPortSearchError("");
      } catch (requestError) {
        setOriginPorts([]);
        setPortSearchError(getShipmentError(requestError, "Unable to search ports. Check that Core service is running."));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [originSearch]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (destinationSearch.trim().length < 2) return setDestinationPorts([]);
      try {
        const response = await getPorts(1, 25, destinationSearch);
        setDestinationPorts(response.data.data);
        setPortSearchError("");
      } catch (requestError) {
        setDestinationPorts([]);
        setPortSearchError(getShipmentError(requestError, "Unable to search ports. Check that Core service is running."));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destinationSearch]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCustomerChange(event) {
    const customerUserId = event.target.value;
    const customer = customers.find((item) => item.id === Number(customerUserId));
    setForm((current) => ({
      ...current,
      customerUserId,
      customerName: customer?.name || "",
    }));
  }

  async function handleCompanyChange(event) {
    handleChange(event);
    try {
      const response = isAdmin ? await getShipsByCompany(event.target.value) : await getShips();
      setShips(response.data.data);
      setForm((current) => ({ ...current, shipId: "" }));
    } catch (requestError) {
      setError(getShipmentError(requestError, "Unable to load company ships."));
    }
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
    setOriginSearch("");
    setDestinationSearch("");
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const { companyId, ...shipmentForm } = form;
      const payload = {
        ...shipmentForm,
        ...(isAdmin ? { companyId: Number(companyId) } : {}),
        shipId: Number(form.shipId),
        customerUserId: form.customerUserId ? Number(form.customerUserId) : null,
        customerName: form.customerUserId ? form.customerName : null,
        originPortId: Number(form.originPortId),
        destinationPortId: Number(form.destinationPortId),
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
      companyId: shipment.companyId || "",
      shipmentNumber: shipment.shipmentNumber,
      shipId: shipment.shipId,
      customerName: shipment.customerName,
      customerUserId: shipment.customerUserId || "",
      originPortId: shipment.originPortId || "",
      destinationPortId: shipment.destinationPortId || "",
      departureDate: shipment.departureDate.slice(0, 10),
      arrivalDate: shipment.arrivalDate.slice(0, 10),
      status: shipment.status,
    });

    setOriginSearch(shipment.origin);
    setDestinationSearch(shipment.destination);

    setError("");
    setShowForm(true);
  }

  function clearFilters() {
    setFilters({ page: 1, limit: 10, status: "", origin: "", destination: "", search: "" });
  }

  async function confirmDelete() {
    if (!shipmentPendingDelete) return;
    try {
      setDeleting(true);
      await deleteShipment(shipmentPendingDelete.id);

      if (editingId === shipmentPendingDelete.id) {
        resetForm();
      }

      setShipmentPendingDelete(null);
      await loadShipments();
    } catch (err) {
      setError(getShipmentError(err, "Unable to delete shipment."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="shipments-page">
      <section className="shipments-header">
        <div>
          <p className="eyebrow">ShipOps</p>
          <h1>Shipments</h1>
          <p>{canManageShipments ? "Manage shipments assigned to your operation." : "View shipments assigned to your account."}</p>
        </div>
        {canManageShipments && <button type="button" className="add-shipment-button" onClick={() => { resetForm(); setShowForm(true); }}>Add new shipment</button>}
      </section>

      {canManageShipments && showForm && <div className="shipment-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) resetForm(); }}>
        <section className="shipment-form-card shipment-modal" role="dialog" aria-modal="true" aria-labelledby="shipment-form-title">
          <div className="shipment-modal-heading"><div><h2 id="shipment-form-title">{editingId ? "Edit shipment" : "Create shipment"}</h2><p className="form-note">Set the shipment basics, select its route, then confirm the schedule.</p></div><button type="button" className="modal-close" onClick={resetForm} aria-label="Close shipment form">×</button></div>

        <form onSubmit={handleSubmit} className="shipment-form">
          <p className="form-section-title full-width">Shipment details</p>

          <label>
            Shipment Number
            <input
              name="shipmentNumber"
              value={form.shipmentNumber}
              onChange={handleChange}
              required
            />
          </label>

          {isAdmin && <label>
            Company
            <select name="companyId" value={form.companyId} onChange={handleCompanyChange} required>
              <option value="">Select a company</option>
              {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
          </label>}

          <label>
            Ship
            <select name="shipId" value={form.shipId} onChange={handleChange} required>
              <option value="">Select a ship</option>
              {ships.map((ship) => <option key={ship.id} value={ship.id}>{ship.name}</option>)}
            </select>
          </label>

          <label>
            Customer <span>(optional)</span>
            <select name="customerUserId" value={form.customerUserId} onChange={handleCustomerChange}>
              <option value="">Unassigned</option>
              {form.customerUserId && !customers.some((customer) => customer.id === Number(form.customerUserId)) && <option value={form.customerUserId}>{form.customerName || "Assigned customer"}</option>}
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} ({customer.email})</option>)}
            </select>
          </label>

          <p className="form-section-title full-width">Route and ports</p>

          <label className="port-search-field">
            Search origin port
            <input value={originSearch} onChange={(event) => setOriginSearch(event.target.value)} placeholder="Search by port or country" />
          </label>
          <label>
            Origin port
            <select name="originPortId" value={form.originPortId} onChange={handleChange} required>
              <option value="">Select an origin port</option>
              {form.originPortId && !originPorts.some((port) => port.id === Number(form.originPortId)) && <option value={form.originPortId}>{originSearch || "Current origin"}</option>}
              {originPorts.map((port) => <option key={port.id} value={port.id}>{port.name}, {port.country} {port.unLocode ? `(${port.unLocode})` : ""}</option>)}
            </select>
            {originSearch.trim().length >= 2 && originPorts.length === 0 && !portSearchError && <small>No matching ports found.</small>}
          </label>

          <label className="port-search-field">
            Search destination port
            <input value={destinationSearch} onChange={(event) => setDestinationSearch(event.target.value)} placeholder="Search by port or country" />
          </label>
          <label>
            Destination port
            <select name="destinationPortId" value={form.destinationPortId} onChange={handleChange} required>
              <option value="">Select a destination port</option>
              {form.destinationPortId && !destinationPorts.some((port) => port.id === Number(form.destinationPortId)) && <option value={form.destinationPortId}>{destinationSearch || "Current destination"}</option>}
              {destinationPorts.map((port) => <option key={port.id} value={port.id}>{port.name}, {port.country} {port.unLocode ? `(${port.unLocode})` : ""}</option>)}
            </select>
            {destinationSearch.trim().length >= 2 && destinationPorts.length === 0 && !portSearchError && <small>No matching ports found.</small>}
          </label>

          <p className="form-section-title full-width">Schedule and status</p>

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

            <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>
          </div>

        </form>
        </section>
      </div>}

      {(error || portSearchError) && <p className="error-message">{error || portSearchError}</p>}

      {shipmentPendingDelete && <div className="delete-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setShipmentPendingDelete(null); }}>
        <section className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-shipment-title" aria-describedby="delete-shipment-description">
          <div className="delete-dialog-icon" aria-hidden="true">!</div>
          <div><p className="section-kicker">Confirm deletion</p><h2 id="delete-shipment-title">Delete shipment {shipmentPendingDelete.shipmentNumber}?</h2><p id="delete-shipment-description">This permanently removes the shipment record. Cargo and documents should be removed first if they are still linked to it.</p></div>
          <div className="delete-dialog-actions"><button type="button" className="secondary-button" onClick={() => setShipmentPendingDelete(null)} disabled={deleting}>Cancel</button><button type="button" className="danger-button" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete shipment"}</button></div>
        </section>
      </div>}

      <section className="shipment-list-card">

        <div className="list-heading">
          <div className="shipment-list-title">
            <h2>All Shipments</h2>
            <span>{pagination?.total ?? shipments.length}</span>
          </div>
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

          <div className="filter-toolbar">
            <label className="filter-search">
              <span className="visually-hidden">Search shipments</span>
              <svg className="filter-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.2 4.2" /></svg>
              <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search shipment, customer, or route" />
            </label>
            <button type="button" className="filter-reset" onClick={clearFilters} disabled={!hasActiveFilters}>Clear</button>
          </div>

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
                      Customer: {shipment.customerName || "Unassigned"}
                    </p>

                    <p>
                      Status: <strong>{shipment.status}</strong>
                    </p>
                  </div>

                  {canManageShipments && <div className="row-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/shipments/${shipment.id}`);
                      }}
                    >
                      View cargo
                    </button>

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
                        setShipmentPendingDelete(shipment);
                      }}
                    >
                      Delete
                    </button>
                  </div>}
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
