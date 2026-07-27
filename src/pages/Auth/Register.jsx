import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/auth.service";
import { validateRegister } from "./auth.validation";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((currentData) => ({ ...currentData, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateRegister(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      await register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      });
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data?.error || error.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page auth-with-image">
      <aside className="auth-visual" aria-label="Maritime logistics overview">
        <div className="auth-visual-content">
          <p className="auth-visual-brand">⚓ ShipOps</p>
          <h2>Bring your operations into one view.</h2>
          <p>Set up your account, then begin building your company fleet and shipment workspace.</p>
          <div className="auth-feature-list"><span>Company & fleet setup</span><span>Global port catalog</span><span>Live-ready vessel tracking</span></div>
        </div>
      </aside>
      <main className="auth-content">
        <div className="auth-card auth-card-register">
          <p className="auth-kicker">Get started</p>
          <h1>Create your account</h1>
          <p className="auth-subtitle">Create an account to start using ShipOps.</p>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <label>
              Full name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <span id="name-error" className="field-error">{errors.name}</span>}
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
            </label>

            <label>
              Password
              <span className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
              {errors.password && <span id="password-error" className="field-error">{errors.password}</span>}
            </label>

            <button type="submit">Create account</button>
          </form>

          {message && <p className="form-message">{message}</p>}

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </main>
    </div>
  );
}

export default Register;
