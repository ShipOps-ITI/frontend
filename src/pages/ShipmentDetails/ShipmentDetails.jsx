import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");

  const [editingCargoId, setEditingCargoId] = useState(null);
  const [isCreatingCargo, setIsCreatingCargo] = useState(false);

  const [cargoList, setCargoList] = useState([]);
  const [cargoFilters, setCargoFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    search: "",
  });
  const [cargoPagination, setCargoPagination] = useState(null);

  const [cargoForm, setCargoForm] = useState({
    shipmentId: "",
    cargoName: "",
    cargoType: "",
    weight: "",
    quantity: "",
    containerNumber: "",
    description: "",
    status: ""
  });



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
    status: ""
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
    status: ""
  });
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
    setEditingCargoId(null);
    setIsCreatingCargo(false);
    resetCargoForm();
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

        {cargoList.length === 0 && !isCreatingCargo && (
          <p className="no-results">
            No cargo found for this shipment.
          </p>
        )}

        {(editingCargoId || isCreatingCargo) && (
          <section className="shipment-details-card cargo-form-card">
            <h2>{editingCargoId ? "Edit Cargo" : "Add Cargo"}</h2>
            <form className="cargo-form" onSubmit={handleCargoUpdate}>
              <input
                name="cargoName"
                value={cargoForm.cargoName}
                onChange={handleCargoChange}
                placeholder="Cargo name"
              />

              <input
                name="cargoType"
                value={cargoForm.cargoType}
                onChange={handleCargoChange}
                placeholder="Cargo type"
              />

              <input
                type="number"
                name="weight"
                value={cargoForm.weight}
                onChange={handleCargoChange}
                placeholder="Weight"
              />

              <input
                type="number"
                name="quantity"
                value={cargoForm.quantity}
                onChange={handleCargoChange}
                placeholder="Quantity"
              />

              <input
                name="containerNumber"
                value={cargoForm.containerNumber}
                onChange={handleCargoChange}
                placeholder="Container number"
              />

              <textarea
                name="description"
                value={cargoForm.description}
                onChange={handleCargoChange}
                placeholder="Description"
              />

              <select
                name="status"
                value={cargoForm.status}
                onChange={handleCargoChange}
              >
                <option value="" disabled>
                  Select status
                </option>
                <option value="Pending">Pending</option>
                <option value="Loaded">Loaded</option>
                <option value="InTransit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Damaged">Damaged</option>
              </select>

              <div className="form-actions">
                <button type="submit">Save</button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditingCargoId(null);
                    setIsCreatingCargo(false);
                    resetCargoForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
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
                  <p>Container Number: {cargo.containerNumber}</p>
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

    </main>

  );
}

export default ShipmentDetails;

