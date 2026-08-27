import { useEffect, useState } from "react";
import { getUser } from "../../services/auth.service";
import { getCompanies } from "../../services/company.service";
import { createUser, deleteUser, getUsers, updateUser } from "../../services/users.service";
import "./Users.css";

const roles = ["ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER", "CUSTOMER"];
const isCompanyRole = (role) => ["COMPANY_ADMIN", "FLEET_MANAGER", "CUSTOMER"].includes(role);

const emptyForm = {
  id: null,
  name: "",
  email: "",
  password: "",
  role: "CUSTOMER",
  companyId: "",
  isActive: true,
};

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;
const formatRole = (role) => role?.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ");

function Users() {
  const currentUser = getUser();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [usersResponse, companiesResponse] = await Promise.all([
        getUsers(),
        getCompanies(1, 100),
      ]);
      setUsers(usersResponse.data);
      setCompanies(companiesResponse.data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }

  function startEditing(user) {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId ?? "",
      isActive: user.isActive,
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "role" && value === "ADMIN" ? { companyId: "" } : {}),
    }));
  }

  function cancelEditing() {
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(false);
  }

  function startCreating() {
    setForm({ ...emptyForm, companyId: currentUser?.role === "COMPANY_ADMIN" ? String(currentUser.companyId ?? "") : "" });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const selectedCompanyId = currentUser?.role === "COMPANY_ADMIN" ? currentUser.companyId : form.companyId;

    if (isCompanyRole(form.role) && !selectedCompanyId) {
      setError("A Company Admin, Fleet Manager, or Customer must be assigned to a company.");
      return;
    }

    if (form.id === currentUser?.id && (form.role !== currentUser?.role || !form.isActive)) {
      setError("You cannot remove your own Admin access or deactivate your own account.");
      return;
    }

    try {
      setSaving(true);
      if (form.id) {
        await updateUser(form.id, {
          role: form.role,
          companyId: isCompanyRole(form.role) ? Number(selectedCompanyId) : null,
          isActive: form.isActive,
        });
        setSuccess("User updated. They must log in again before new access permissions apply.");
      } else {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          ...(isCompanyRole(form.role) ? { companyId: Number(selectedCompanyId) } : {}),
        });
        setSuccess("Account created. The user can now sign in.");
      }
      setForm(emptyForm);
      setShowForm(false);
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update user."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (user.id === currentUser?.id) {
      setError("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return;

    try {
      setError("");
      setSuccess("");
      await deleteUser(user.id);
      setSuccess(`${user.name}'s account was deleted.`);
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to delete user."));
    }
  }

  return (
    <main className="users-page">
      <section className="users-header">
        <div><p className="eyebrow">Workspace access</p><h1>User management</h1><p>Create accounts and control access for your operations team.</p></div>
        {!showForm && <button type="button" onClick={startCreating}>Create user account</button>}
      </section>

      {showForm && <div
        className="user-modal-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) cancelEditing();
        }}
      >
        <section className="users-card user-form-card user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div className="list-heading user-modal-heading">
            <div><p className="section-kicker">{form.id ? "Account settings" : "New account"}</p><h2 id="user-modal-title">{form.id ? "Edit user access" : "Create a user account"}</h2></div>
            <button type="button" className="user-modal-close" onClick={cancelEditing} aria-label="Close user form">×</button>
          </div>
          {error && <p className="error-message">{error}</p>}
          <form className="user-form" onSubmit={handleSubmit}>
          <label>Name<input name="name" value={form.name} onChange={handleChange} disabled={Boolean(form.id)} required /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} disabled={Boolean(form.id)} required /></label>
          {!form.id && <label>Password<input name="password" type="password" value={form.password} onChange={handleChange} minLength="8" required /></label>}
          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
            {(form.id ? roles : (currentUser?.role === "ADMIN" ? ["COMPANY_ADMIN", "FLEET_MANAGER", "CUSTOMER"] : ["FLEET_MANAGER", "CUSTOMER"])).map((role) => <option key={role} value={role}>{formatRole(role)}</option>)}
            </select>
            <small>{form.role === "FLEET_MANAGER" ? "Can manage fleets, ships, and shipments." : form.role === "CUSTOMER" ? "Can view only shipments assigned to this account." : "Can manage the company workspace and its users."}</small>
          </label>
          {currentUser?.role === "COMPANY_ADMIN" ? <label>
            Company
            <input value={companies.find((company) => company.id === Number(currentUser.companyId))?.name || "Your company"} disabled />
          </label> : <label>
            Company {isCompanyRole(form.role) && <span>(required)</span>}
            <select name="companyId" value={form.companyId} onChange={handleChange} disabled={form.role === "ADMIN" || currentUser?.role === "COMPANY_ADMIN"} required={isCompanyRole(form.role)}>
              <option value="">{isCompanyRole(form.role) ? "Select a company" : "No company assignment"}</option>
              {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
          </label>}
          {form.id && <label className="active-toggle">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} disabled={form.id === currentUser?.id} />
            Account is active
          </label>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>{saving ? "Saving..." : form.id ? "Save access" : "Create account"}</button>
            <button type="button" className="secondary-button" onClick={cancelEditing}>Cancel</button>
          </div>
          </form>
        </section>
      </div>}

      {error && !showForm && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <section className="users-card">
        <div className="list-heading"><div><p className="section-kicker">Access directory</p><h2>Users</h2></div><span>{users.length}</span></div>
        {loading ? <p>Loading users...</p> : users.length === 0 ? <p>No users registered yet.</p> : (
          <div className="user-list">
            {users.map((user) => (
              <article className="user-row" key={user.id}>
                <div>
                  <h3>{user.name} {!user.isActive && <small>Inactive</small>}</h3>
                  <p>{user.email}</p>
                  <p>{user.role.replace("_", " ")} · {user.companyId ? companies.find((company) => company.id === user.companyId)?.name || `Company #${user.companyId}` : "No company assignment"}</p>
                </div>
                <div className="user-row-actions">
                  <button type="button" className="secondary-button" onClick={() => startEditing(user)}>Manage</button>
                  {currentUser?.role === "ADMIN" && user.id !== currentUser.id && <button type="button" className="danger-button" onClick={() => handleDelete(user)}>Delete</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Users;
