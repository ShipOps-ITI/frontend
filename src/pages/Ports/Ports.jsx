import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination/Pagination";
import { countries } from "../../constants/countries";
import { getUser } from "../../services/auth.service";
import { createPort, deletePort, getPorts, updatePort } from "../../services/port.service";
import "./Ports.css";

const emptyForm = { name: "", country: "", latitude: "", longitude: "" };
const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

function Ports() {
  const isAdmin = getUser()?.role === "ADMIN";
  const [ports, setPorts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadPorts(); }, []);

  async function loadPorts(page = 1) {
    try {
      setLoading(true);
      setError("");
      const response = await getPorts(page, 25, search);
      setPorts(response.data.data);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load ports."));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleSearch(event) {
    event.preventDefault();
    loadPorts(1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const data = {
      name: form.name.trim(),
      country: form.country,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };

    try {
      setSaving(true);
      setError("");
      if (editingId) await updatePort(editingId, data);
      else await createPort(data);
      resetForm();
      await loadPorts(editingId ? pagination?.page : 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to save port."));
    } finally {
      setSaving(false);
    }
  }

  function startEditing(port) {
    setForm({ name: port.name, country: port.country, latitude: port.latitude, longitude: port.longitude });
    setEditingId(port.id);
    setShowForm(true);
    setError("");
  }

  async function handleDelete(port) {
    if (!window.confirm(`Delete ${port.name}, ${port.country}? This cannot be undone.`)) return;
    try {
      setError("");
      await deletePort(port.id);
      if (editingId === port.id) resetForm();
      await loadPorts(ports.length === 1 && pagination?.page > 1 ? pagination.page - 1 : pagination?.page);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to delete port."));
    }
  }

  return (
    <main className="ports-page">
      <section className="ports-header">
        <p className="eyebrow">ShipOps Operations</p>
        <h1>Ports</h1>
        <p>Maintain the ports available when planning voyages.</p>
      </section>

      {isAdmin && showForm && (
        <section className="ports-card">
          <h2>{editingId ? "Edit custom port" : "Add custom port"}</h2>
          <form className="port-form" onSubmit={handleSubmit}>
            <label>Port name<input name="name" value={form.name} onChange={handleChange} minLength="2" required /></label>
            <label>
              Country
              <select name="country" value={form.country} onChange={handleChange} required>
                <option value="">Select a country</option>
                {countries.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
            </label>
            <label>Latitude<input name="latitude" type="number" min="-90" max="90" step="any" value={form.latitude} onChange={handleChange} required /></label>
            <label>Longitude<input name="longitude" type="number" min="-180" max="180" step="any" value={form.longitude} onChange={handleChange} required /></label>
            <div className="form-actions">
              <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Add port"}</button>
              {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </section>
      )}

      {error && <p className="error-message">{error}</p>}

      <section className="ports-card">
        <div className="list-heading">
          <div><h2>Available ports</h2><span>{pagination?.total || 0}</span></div>
          {isAdmin && <button type="button" onClick={() => { resetForm(); setShowForm(true); }}>Add new port</button>}
        </div>
        <form className="port-search" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by port, country, or UN/LOCODE"
            aria-label="Search ports"
          />
          <button type="submit">Search</button>
        </form>
        {loading ? <p>Loading ports...</p> : ports.length === 0 ? <p>No ports have been added yet.</p> : (
          <div className="port-list">
            {ports.map((port) => (
              <article className="port-row" key={port.id}>
                <div>
                  <h3>{port.name}</h3>
                  <p>{port.country} {port.unLocode && `· ${port.unLocode}`}</p>
                  <p>{port.latitude.toFixed(5)}, {port.longitude.toFixed(5)}</p>
                </div>
                {isAdmin && <div className="row-actions">
                  <button type="button" className="secondary-button" onClick={() => startEditing(port)}>Edit</button>
                  <button type="button" className="danger-button" onClick={() => handleDelete(port)}>Delete</button>
                </div>}
              </article>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={loadPorts} />
      </section>
    </main>
  );
}

export default Ports;
