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

  useEffect(() => {
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
  }, []);

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
          <p>{canManageShipments ? "Manage shipments assigned to your operation." : "View shipments assigned to your account."}</p>
        </div>
      </section>

      {canManageShipments && showForm && <section className="shipment-form-card">
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

          <label>
            Search origin port
            <input value={originSearch} onChange={(event) => setOriginSearch(event.target.value)} placeholder="Type at least 2 characters" />
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

          <label>
            Search destination port
            <input value={destinationSearch} onChange={(event) => setDestinationSearch(event.target.value)} placeholder="Type at least 2 characters" />
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
      </section>}

      {(error || portSearchError) && <p className="error-message">{error || portSearchError}</p>}

      <section className="shipment-list-card">

        <div className="list-heading">
          <div className="shipment-list-title">
            <h2>All Shipments</h2>
            <span>{pagination?.total ?? shipments.length}</span>
          </div>
          {canManageShipments && <button type="button" onClick={() => { resetForm(); setShowForm(true); }}>Add new shipment</button>}
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
                      Customer: {shipment.customerName || "Unassigned"}
                    </p>

                    <p>
                      Status: <strong>{shipment.status}</strong>
                    </p>
                  </div>

                  {canManageShipments && <div className="row-actions">
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
