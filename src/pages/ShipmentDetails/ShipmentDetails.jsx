import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getShipment } from "../../services/shipment.service";
import "./ShipmentDetails.css";
import {
  createCargo,
  updateCargo,
  deleteCargo,
  getCargo,
} from "../../services/cargo.service";
import Pagination from "../../components/Pagination/Pagination";


function ShipmentDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");

  const [editingCargoId, setEditingCargoId] = useState(null);
  const [isCreatingCargo, setIsCreatingCargo] = useState(
    () => searchParams.get("addCargo") === "1",
  );

  const [cargoList, setCargoList] = useState([]);
  const [cargoFilters, setCargoFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    search: "",
  });
  const [cargoPagination, setCargoPagination] = useState(null);

  const [cargoForm, setCargoForm] = useState(() => ({
    shipmentId: searchParams.get("addCargo") === "1" ? id : "",
    cargoName: "",
    cargoType: "",
    weight: "",
    quantity: "",
    containerNumber: "",
    description: "",
    status: "Pending"
  }));



  useEffect(() => {
    async function fetchShipment() {
      try {
        const response = await getShipment(id);
        setShipment(response.data.data);
      } catch (error) {
        console.log(error);
        setError(
          error.response?.data?.message ||
          "Unable to load shipment details."
        );
      }
    }

    fetchShipment();
  }, [id]);

  const loadCargo = useCallback(async (page = cargoFilters.page) => {
    try {
      const response = await getCargo({
        shipmentId: Number(id),
        page: Number(page),
        limit: Number(cargoFilters.limit),
        status: cargoFilters.status || undefined,
        search: cargoFilters.search || undefined,
      });

      setCargoList(response.data.data);
      setCargoPagination(response.data.pagination);
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message ||
        "Unable to load cargo list."
      );
    }
  }, [cargoFilters, id]);

  useEffect(() => {
    if (!id) return;

    async function fetchCargo() {
      await loadCargo();
    }

    fetchCargo();
  }, [id, loadCargo]);

  function handleEditCargo(cargo) {
  setEditingCargoId(cargo.id);
  setIsCreatingCargo(false);

  setCargoForm({
    shipmentId: cargo.shipmentId,
    cargoName: cargo.cargoName,
    cargoType: cargo.cargoType,
    weight: cargo.weight,
    quantity: cargo.quantity,
    containerNumber: cargo.containerNumber || "",
    description: cargo.description || "",
    status: cargo.status
  });
}

function handleAddCargo() {
  setEditingCargoId(null);
  setIsCreatingCargo(true);

  setCargoForm({
    shipmentId: id,
    cargoName: "",
    cargoType: "",
    weight: "",
    quantity: "",
    containerNumber: "",
    description: "",
    status: "Pending"
  });
}

async function handleDeleteCargo(id) {
  if (!window.confirm("Delete cargo?")) {
    return;
  }

  try {
    await deleteCargo(id);
    await loadCargo();
  } catch (error) {
    setError(
      error.response?.data?.message ||
      "Unable to delete cargo."
    );
  }
}

function handleCargoChange(event) {
  const { name, value } = event.target;

  setCargoForm((current) => ({
    ...current,
    [name]: value
  }));
}

function handleCargoFilterChange(event) {
  const { name, value } = event.target;
  setCargoFilters((current) => ({
    ...current,
    [name]: name === "limit" ? Number(value) : value,
    page: ["limit", "status", "search"].includes(name) ? 1 : current.page,
  }));
}

function clearCargoFilters() {
  setCargoFilters({
    page: 1,
    limit: 10,
    status: "",
    search: "",
  });
}

function handleCargoPageChange(nextPage) {
  setCargoFilters((current) => ({ ...current, page: nextPage }));
}

function resetCargoForm() {
  setCargoForm({
    shipmentId: "",
    cargoName: "",
    cargoType: "",
    weight: "",
    quantity: "",
    containerNumber: "",
    description: "",
    status: "Pending"
  });
}

function closeCargoModal() {
  setEditingCargoId(null);
  setIsCreatingCargo(false);
  resetCargoForm();

  if (searchParams.get("addCargo") === "1") {
    setSearchParams({}, { replace: true });
  }
}

async function handleCargoUpdate(event) {
  event.preventDefault();

  try {
    const payload = {
      ...cargoForm,
      shipmentId: Number(cargoForm.shipmentId),
      weight: cargoForm.weight === "" ? undefined : Number(cargoForm.weight),
      quantity: cargoForm.quantity === "" ? undefined : Number(cargoForm.quantity)
    };

    if (editingCargoId) {
      await updateCargo(editingCargoId, payload);
    } else {
      await createCargo(payload);
    }

    await loadCargo();
    closeCargoModal();
  } catch (error) {
    setError(
      error.response?.data?.message ||
      "Unable to update cargo."
    );
  }
}



  if (error) {
    return (
      <main className="shipment-details-page">
        <p className="error-message">
          {error}
        </p>
      </main>
    );
  }



  if (!shipment) {
    return (
      <main className="shipment-details-page">
        <p>
          Loading shipment...
        </p>
      </main>
    );
  }



  return (

    <main className="shipment-details-page">


      <section className="shipment-details-header">

        <p className="eyebrow">
          ShipOps
        </p>


        <h1>
          Shipment {shipment.shipmentNumber}
        </h1>


        <p>
          {shipment.origin} → {shipment.destination}
        </p>


      </section>




      <section className="shipment-details-card">


        <h2>
          Shipment Information
        </h2>



        <div className="shipment-info-grid">


          <div>
            <span>
              Customer
            </span>

            <p>
              {shipment.customerName}
            </p>
          </div>



          <div>
            <span>
              Status
            </span>

            <p>
              {shipment.status}
            </p>
          </div>



          <div>
            <span>
              Departure Date
            </span>

            <p>
              {new Date(
                shipment.departureDate
              ).toLocaleDateString()}
            </p>
          </div>




          <div>
            <span>
              Arrival Date
            </span>

            <p>
              {new Date(
                shipment.arrivalDate
              ).toLocaleDateString()}
            </p>
          </div>



        </div>


      </section>





      <section className="shipment-details-card">


        <div className="list-heading">

          <h2>
            Cargo
          </h2>


          <span>
            {cargoPagination?.total ?? cargoList.length}
          </span>

          <button
            type="button"
            className="secondary-button"
            onClick={handleAddCargo}
          >
            Add Cargo
          </button>

        </div>




        <div className="cargo-filter-bar">
          <label>
            Status
            <select
              name="status"
              value={cargoFilters.status}
              onChange={handleCargoFilterChange}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Loaded">Loaded</option>
              <option value="InTransit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Damaged">Damaged</option>
            </select>
          </label>

          <label>
            Search
            <input
              name="search"
              value={cargoFilters.search}
              onChange={handleCargoFilterChange}
              placeholder="Cargo name, type, container"
            />
          </label>

          <div className="filter-actions">
            <label>
              Page size
              <select
                name="limit"
                value={cargoFilters.limit}
                onChange={handleCargoFilterChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>

            <button
              type="button"
              className="secondary-button clear-button"
              onClick={clearCargoFilters}
            >
              Clear
            </button>
          </div>
        </div>

        {cargoList.length === 0 && !(isCreatingCargo || editingCargoId) && (
          <p className="no-results">
            No cargo found for this shipment.
          </p>
        )}

        {(editingCargoId || isCreatingCargo) && (
          <div
            className="cargo-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeCargoModal();
            }}
          >
            <section
              className="shipment-details-card cargo-form-card cargo-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cargo-modal-title"
            >
              <div className="cargo-form-heading cargo-modal-heading">
                <div>
                  <p className="panel-kicker">Cargo item</p>
                  <h2 id="cargo-modal-title">{editingCargoId ? "Edit cargo item" : "Add cargo item"}</h2>
                  <p>Describe the goods being carried. Weight is recorded in kilograms.</p>
                </div>
                <button
                  type="button"
                  className="cargo-modal-close"
                  onClick={closeCargoModal}
                  aria-label="Close cargo form"
                >
                  ×
                </button>
              </div>
            <form className="cargo-form" onSubmit={handleCargoUpdate}>
              <p className="cargo-form-section">Cargo details</p>
              <label>Goods description<input name="cargoName" value={cargoForm.cargoName} onChange={handleCargoChange} placeholder="e.g. Roasted coffee beans" required /></label>

              <label>Cargo type<select name="cargoType" value={cargoForm.cargoType} onChange={handleCargoChange} required><option value="">Select a cargo type</option><option value="General cargo">General cargo</option><option value="Containerized">Containerized</option><option value="Bulk">Bulk</option><option value="Refrigerated">Refrigerated</option><option value="Dangerous goods">Dangerous goods</option><option value="Other">Other</option></select></label>

              <div className="cargo-form-row"><label>Gross weight <span>(kg)</span><input type="number" min="0.01" step="0.01" name="weight" value={cargoForm.weight} onChange={handleCargoChange} placeholder="e.g. 1250" required /></label>

                <label>Package quantity<input type="number" min="1" step="1" name="quantity" value={cargoForm.quantity} onChange={handleCargoChange} placeholder="e.g. 24" required /></label></div>

              <label className="cargo-description">Handling notes <span>(optional)</span><textarea name="description" value={cargoForm.description} onChange={handleCargoChange} placeholder="Packaging, handling, temperature, or other useful instructions" /></label>

              <p className="cargo-form-section">Operational status</p>
              <label>Status<select name="status" value={cargoForm.status} onChange={handleCargoChange}>
                <option value="Pending">Pending</option>
                <option value="Loaded">Loaded</option>
                <option value="InTransit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Damaged">Damaged</option>
              </select></label>

              <div className="form-actions">
                <button type="submit">Save</button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeCargoModal}
                >
                  Cancel
                </button>
              </div>
            </form>
            </section>
          </div>
        )}

        {cargoList.length > 0 && (
          <>
            <div className="cargo-list">
              {cargoList.map((cargo) => (
                <article className="cargo-card" key={cargo.id}>
                  <div className="cargo-actions">
                    <button
                      className="secondary-button"
                      onClick={() => handleEditCargo(cargo)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      onClick={() => handleDeleteCargo(cargo.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <h3>{cargo.cargoName}</h3>
                  <p>Type: {cargo.cargoType}</p>
                  <p>Weight: {cargo.weight}</p>
                  <p>Quantity: {cargo.quantity}</p>
                  <p>Description: {cargo.description}</p>
                  <p>Status: <strong>{cargo.status}</strong></p>
                  <p className="cargo-date">
                    Created: {new Date(cargo.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
            <Pagination pagination={cargoPagination} onPageChange={handleCargoPageChange} />
          </>
        )}

      </section>

      <section className="shipment-details-card shipment-documents-card">
        <div>
          <p className="panel-kicker">Shipment file room</p>
          <h2>Documents</h2>
          <p>Keep invoices, packing lists, bills of lading, and customs files connected to this shipment.</p>
        </div>
        <button type="button" onClick={() => navigate(`/documents?shipmentId=${id}`)}>Manage shipment documents</button>
      </section>

    </main>

  );
}

export default ShipmentDetails;

