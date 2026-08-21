import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { countries } from "../../constants/countries";
import { createCompany } from "../../services/company.service";
import { completeCompanyOnboarding, logout } from "../../services/auth.service";
import "../Auth/Auth.css";

const emptyForm = { name: "", country: "", contactEmail: "", phone: "" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CompanyOnboarding() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onChange({ target: { name, value } }) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setMessage("");
  }

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Company name must be at least 2 characters.";
    if (!form.country) next.country = "Select the country where your company operates.";
    if (!emailPattern.test(form.contactEmail.trim())) next.contactEmail = "Enter a valid contact email address.";
    return next;
  }

  async function submit(event) {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) return setErrors(validationErrors);

    try {
      setSubmitting(true);
      const response = await createCompany({
        name: form.name.trim(),
        country: form.country,
        contactEmail: form.contactEmail.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
      });
      await completeCompanyOnboarding(response.data.data.id);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.error || "Unable to create your company. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="auth-page">
      <section className="auth-content">
        <div className="auth-card auth-card-register">
          <p className="auth-kicker">Company setup</p>
          <h1>Create your company</h1>
          <p className="auth-subtitle">This company will be your ShipOps workspace. You can invite fleet managers and customers after setup.</p>
          <form onSubmit={submit} className="auth-form" noValidate>
            <label>Company name<input name="name" value={form.name} onChange={onChange} aria-invalid={Boolean(errors.name)} />{errors.name && <span className="field-error">{errors.name}</span>}</label>
            <label>Country<select name="country" value={form.country} onChange={onChange} aria-invalid={Boolean(errors.country)}><option value="">Select a country</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select>{errors.country && <span className="field-error">{errors.country}</span>}</label>
            <label>Contact email<input type="email" name="contactEmail" value={form.contactEmail} onChange={onChange} aria-invalid={Boolean(errors.contactEmail)} />{errors.contactEmail && <span className="field-error">{errors.contactEmail}</span>}</label>
            <label>Phone <span>(optional)</span><input type="tel" name="phone" value={form.phone} onChange={onChange} /></label>
            <button type="submit" disabled={submitting}>{submitting ? "Creating workspace..." : "Create company workspace"}</button>
          </form>
          {message && <p className="form-message">{message}</p>}
          <button type="button" className="onboarding-signout" onClick={signOut}>Sign out</button>
        </div>
      </section>
    </main>
  );
}
