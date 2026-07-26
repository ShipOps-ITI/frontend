import { useEffect, useRef, useState } from "react";
import Pagination from "../../components/Pagination/Pagination";
import ShipMap from "../../components/ShipMap/ShipMap";
import { countries, getCountryFlagImageUrl } from "../../constants/countries";
import { getCompanies } from "../../services/company.service";
import { getFleetsByCompany } from "../../services/fleet.service";
import { getUser } from "../../services/auth.service";
import { createShip, deleteShip, getShips, updateShip } from "../../services/ship.service";
import "./Ships.css";

const emptyForm = {
  companyId: "",
  fleetId: "",
  name: "",
  imoNumber: "",
  mmsiNumber: "",
  flag: "",
  capacityTonnage: "",
  shipType: "",
  availabilityState: "ACTIVE",
  currentLatitude: "",
  currentLongitude: "",
  lengthMeters: "",
  widthMeters: "",
};

const states = ["ACTIVE", "MAINTENANCE", "DOCKED", "AT_SEA"];
const shipTypeGroups = [
  {
    label: "Cargo",
    options: [
      "All Cargo Vessels", "Bulk carrier", "General Cargo", "Container Ship", "Reefer", "Ro-Ro",
      "Vehicles Carrier", "Cement Carrier", "Wood Chips Carrier", "Urea Carrier", "Aggregates Carrier",
      "Limestone Carrier", "Landing Craft", "Livestock Carrier", "Heavy Load Carrier",
    ],
  },
  {
    label: "Tankers",
    options: [
      "All Tankers", "Crude Oil Tanker", "Oil Products Tanker", "Chemical/Oil Tanker", "LNG Tanker",
      "LPG Tanker", "Asphalt/Bitumen", "Bunkering Tanker", "FSO/FPSO", "Other Tanker",
    ],
  },
  {
    label: "Passenger/Cruise",
    options: [
      "All Passenger/Cruise Ships", "Cruise Ship", "Passenger/Cargo Ship", "Passenger/Ro-Ro Ship", "Passenger Ship",
    ],
  },
  {
    label: "Other",
    options: ["Fishing ships", "Yachts/Sailing Vessels", "Military", "Tugs", "Other type/ Auxiliary", "Unknown"],
  },
];
const numberOrNull = (value) => (value === "" ? null : Number(value));
const formatAisUpdate = (value) => {
  if (!value) return "No AIS update received";
  return `AIS updated ${new Date(value).toLocaleString()}`;
};

function Ships() {
  const loggedInUser = getUser();
  const isAdmin = loggedInUser?.role === "ADMIN";
  const [ships, setShips] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const currentPageRef = useRef(1);

  useEffect(() => {
    loadShips();
    loadCompanies();

    const refreshTimer = setInterval(() => {
      loadShips(currentPageRef.current, false);
    }, 30000);

    return () => clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    const companyId = Number(isAdmin ? form.companyId : loggedInUser?.companyId);
    setFleets([]);
    if (Number.isInteger(companyId) && companyId > 0) loadFleets(companyId);
  }, [form.companyId, isAdmin, loggedInUser?.companyId]);

  async function loadShips(page = 1, showLoading = true) {
    try {
      if (showLoading) {
        setLoading(true);
        setError("");
      }
      const response = await getShips(page);
      setShips(response.data.data);
      setPagination(response.data.pagination);
      currentPageRef.current = response.data.pagination?.page || page;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load ships.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  async function loadCompanies() {
    try {
      const response = await getCompanies(1, 100);
      setCompanies(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load companies.");
    }
  }

  async function loadFleets(companyId) {
    try {
      const response = await getFleetsByCompany(companyId);
      setFleets(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load company fleets.");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === "companyId" ? { fleetId: "" } : {}),
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setFleets([]);
    setEditingId(null);
    setShowForm(false);
  }

  function getPayload() {
    const { companyId, ...shipForm } = form;
    return {
      ...shipForm,
      ...(isAdmin ? { companyId: Number(companyId) } : {}),
      fleetId: Number(form.fleetId),
      imoNumber: form.imoNumber || null,
      mmsiNumber: form.mmsiNumber || null,
      shipType: form.shipType || null,
      capacityTonnage: Number(form.capacityTonnage),
      currentLatitude: numberOrNull(form.currentLatitude),
      currentLongitude: numberOrNull(form.currentLongitude),
      lengthMeters: numberOrNull(form.lengthMeters),
      widthMeters: numberOrNull(form.widthMeters),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      const payload = getPayload();

      if (editingId) {
        await updateShip(editingId, payload);
      } else {
        await createShip(payload);
      }

      resetForm();
      await loadShips(editingId ? pagination?.page : 1);
      } catch (requestError) {
      const firstValidationError = requestError.response?.data?.errors?.[0]?.message;
      setError(firstValidationError || requestError.response?.data?.message || "Unable to save ship.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(ship) {
    setForm({
      companyId: ship.companyId,
      fleetId: ship.fleetId || "",
      name: ship.name,
      imoNumber: ship.imoNumber || "",
      mmsiNumber: ship.mmsiNumber || "",
      flag: ship.flag,
      capacityTonnage: ship.capacityTonnage,
      shipType: ship.shipType || "",
      availabilityState: ship.availabilityState,
      currentLatitude: ship.currentLatitude ?? "",
      currentLongitude: ship.currentLongitude ?? "",
      lengthMeters: ship.lengthMeters ?? "",
      widthMeters: ship.widthMeters ?? "",
    });
    setEditingId(ship.id);
    setError("");
    setShowForm(true);
  }

  async function handleDelete(ship) {
    if (!window.confirm(`Delete ${ship.name}? This permanently deletes this ship record and cannot be undone.`)) {
      return;
    }

    try {
      setError("");
      await deleteShip(ship.id);
      if (editingId === ship.id) resetForm();
      await loadShips(ships.length === 1 && pagination?.page > 1 ? pagination.page - 1 : pagination?.page);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete ship.");
    }
  }

  return (
    <main className="ships-page">
      <section className="ships-header">
        <p className="eyebrow">ShipOps</p>
        <h1>Ships</h1>
        <p>Manage vessel records, fleet assignments, and operating status.</p>
      </section>

      {showForm && <section className="ship-form-card">
        <h2>{editingId ? "Edit ship" : "Add ship"}</h2>
        <form className="ship-form" onSubmit={handleSubmit}>
          {isAdmin ? (
            <label>
              Company
              <select name="companyId" value={form.companyId} onChange={handleChange} disabled={Boolean(editingId)} required>
                <option value="">Select a company</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </select>
            </label>
          ) : (
            <label>
              Company
              <input value={companies[0]?.name || "Your assigned company"} disabled />
            </label>
          )}
          <label>
            Fleet
            <select name="fleetId" value={form.fleetId} onChange={handleChange} disabled={isAdmin && !form.companyId} required>
              <option value="">Select a fleet</option>
              {fleets.map((fleet) => <option key={fleet.id} value={fleet.id}>{fleet.name}</option>)}
            </select>
          </label>
          <label>Ship name<input name="name" value={form.name} onChange={handleChange} minLength="2" required /></label>
          <label>IMO number <span>(optional)</span><input name="imoNumber" value={form.imoNumber} onChange={handleChange} /></label>
          <label>MMSI number <span>(optional, required for AIS tracking)</span><input name="mmsiNumber" value={form.mmsiNumber} onChange={handleChange} /></label>
          <label>
            Flag country
            <select name="flag" value={form.flag} onChange={handleChange} required>
              <option value="">Select a flag country</option>
              {form.flag && !countries.includes(form.flag) && (
                <option value={form.flag}>{form.flag}</option>
              )}
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </label>
          <label>Capacity (tonnage)<input name="capacityTonnage" type="number" min="0" step="any" value={form.capacityTonnage} onChange={handleChange} required /></label>
          <label>
            Ship type <span>(optional)</span>
            <select name="shipType" value={form.shipType} onChange={handleChange}>
              <option value="">Select a ship type</option>
              {form.shipType && !shipTypeGroups.some((group) => group.options.includes(form.shipType)) && (
                <option value={form.shipType}>{form.shipType}</option>
              )}
              {shipTypeGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((shipType) => (
                    <option key={shipType} value={shipType}>{shipType}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label>Status<select name="availabilityState" value={form.availabilityState} onChange={handleChange}>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
          <label>Latitude <span>(optional)</span><input name="currentLatitude" type="number" step="any" value={form.currentLatitude} onChange={handleChange} /></label>
          <label>Longitude <span>(optional)</span><input name="currentLongitude" type="number" step="any" value={form.currentLongitude} onChange={handleChange} /></label>
          <label>Length (m) <span>(optional)</span><input name="lengthMeters" type="number" min="0" step="any" value={form.lengthMeters} onChange={handleChange} /></label>
          <label>Width (m) <span>(optional)</span><input name="widthMeters" type="number" min="0" step="any" value={form.widthMeters} onChange={handleChange} /></label>
          <div className="form-actions ship-form-actions">
            <button type="submit" disabled={submitting || companies.length === 0 || fleets.length === 0 || (isAdmin && !form.companyId)}>{submitting ? "Saving..." : editingId ? "Save changes" : "Add ship"}</button>
            {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </section>}

      {error && <p className="error-message">{error}</p>}

      <ShipMap ships={ships} />

      <section className="ship-list-card">
        <div className="list-heading">
          <div className="ship-list-title"><h2>All ships</h2><span>{pagination?.total || 0}</span></div>
          <button type="button" onClick={() => { resetForm(); setShowForm(true); }}>Add new ship</button>
        </div>
        <p className="tracking-note">Location data refreshes every 30 seconds.</p>
        {loading ? <p>Loading ships...</p> : ships.length === 0 ? <p>No ships yet.</p> : (
          <div className="ship-list">
            {ships.map((ship) => (
              <article className="ship-row" key={ship.id}>
                <div>
                  <h3>{ship.name}</h3>
                  <p>
                    {getCountryFlagImageUrl(ship.flag) && (
                      <img
                        className="ship-flag"
                        src={getCountryFlagImageUrl(ship.flag)}
                        alt={`${ship.flag} flag`}
                      />
                    )}
                    {ship.flag} · {ship.shipType || "Unspecified type"} · {ship.capacityTonnage} t {ship.mmsiNumber && `· MMSI ${ship.mmsiNumber}`}
                  </p>
                  <p>{ship.company?.name} {ship.fleet && `· ${ship.fleet.name}`}</p>
                  <p className="ais-update-time">{formatAisUpdate(ship.lastAisUpdateAt)}</p>
                  <span className={`ship-state ${ship.availabilityState.toLowerCase().replace("_", "-")}`}>{ship.availabilityState.replace("_", " ")}</span>
                </div>
                <div className="row-actions"><button type="button" className="secondary-button" onClick={() => handleEdit(ship)}>Edit</button><button type="button" className="danger-button" onClick={() => handleDelete(ship)}>Delete</button></div>
              </article>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={loadShips} />
      </section>
    </main>
  );
}

export default Ships;
