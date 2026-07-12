import { useEffect, useState } from "react";
import { getCompanies } from "../../services/company.service";
import {
  createFleet,
  deleteFleet,
  getFleets,
  updateFleet,
} from "../../services/fleet.service";
import "./Fleets.css";

const emptyForm = {
  companyId: "",
  name: "",
  description: "",
  managedByUserId: "",
  createdByUserId: "",
};

function Fleets() {
  const [fleets, setFleets] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    try {
      setLoading(true);
      setError("");
      const [fleetResponse, companyResponse] = await Promise.all([getFleets(), getCompanies()]);
      setFleets(fleetResponse.data.data);
      setCompanies(companyResponse.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load fleets.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
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

      if (editingId) {
        await updateFleet(editingId, {
          name: form.name,
          description: form.description || undefined,
          managedByUserId: form.managedByUserId,
        });
      } else {
        await createFleet({
          ...form,
          description: form.description || undefined,
        });
      }

      resetForm();
      await loadPageData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save fleet.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(fleet) {
    setForm({
      companyId: fleet.companyId,
      name: fleet.name,
      description: fleet.description || "",
      managedByUserId: fleet.managedByUserId,
      createdByUserId: fleet.createdByUserId,
    });
    setEditingId(fleet.id);
    setError("");
  }

  async function handleDelete(fleet) {
    if (!window.confirm(`Delete ${fleet.name}?`)) {
      return;
    }

    try {
      setError("");
      await deleteFleet(fleet.id);

      if (editingId === fleet.id) {
        resetForm();
      }

      await loadPageData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete fleet.");
    }
  }

  return (
    <main className="fleets-page">
      <section className="fleets-header">
        <div>
          <p className="eyebrow">ShipOps</p>
          <h1>Fleets</h1>
          <p>Group ships into fleets owned by your companies.</p>
        </div>
      </section>

      <section className="fleet-form-card">
        <h2>{editingId ? "Edit fleet" : "Add fleet"}</h2>
        {!editingId && companies.length === 0 && !loading && (
          <p className="form-note">Create a company before adding a fleet.</p>
        )}

        <form onSubmit={handleSubmit} className="fleet-form">
          <label>
            Company
            <select name="companyId" value={form.companyId} onChange={handleChange} disabled={Boolean(editingId)} required>
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </label>

          <label>
            Fleet name
            <input name="name" value={form.name} onChange={handleChange} minLength="2" required />
          </label>

          <label className="full-width">
            Description <span>(optional)</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
          </label>

          <label>
            Manager user ID
            <input name="managedByUserId" value={form.managedByUserId} onChange={handleChange} required />
          </label>

          {!editingId && (
            <label>
              Creator user ID
              <input name="createdByUserId" value={form.createdByUserId} onChange={handleChange} required />
            </label>
          )}

          <div className="form-actions full-width">
            <button type="submit" disabled={submitting || (!editingId && companies.length === 0)}>
              {submitting ? "Saving..." : editingId ? "Save changes" : "Add fleet"}
            </button>
            {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </section>

      {error && <p className="error-message">{error}</p>}

      <section className="fleet-list-card">
        <div className="list-heading">
          <h2>All fleets</h2>
          <span>{fleets.length}</span>
        </div>

        {loading ? <p>Loading fleets...</p> : fleets.length === 0 ? <p>No fleets yet.</p> : (
          <div className="fleet-list">
            {fleets.map((fleet) => (
              <article className="fleet-row" key={fleet.id}>
                <div>
                  <h3>{fleet.name}</h3>
                  <p>{fleet.company?.name || "Unknown company"}</p>
                  {fleet.description && <p>{fleet.description}</p>}
                </div>
                <div className="row-actions">
                  <button type="button" className="secondary-button" onClick={() => handleEdit(fleet)}>Edit</button>
                  <button type="button" className="danger-button" onClick={() => handleDelete(fleet)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Fleets;
