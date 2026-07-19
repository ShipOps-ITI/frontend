import { useState } from "react";
import { login } from "../../services/auth.service";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // login() already stores tokens in localStorage and returns data
            const result = await login(formData);

            setMessage("Login Successful!");
            console.log(result);

            // Navigate after a short delay so user sees success message
            setTimeout(() => {
                navigate("/companies");
            }, 500);
        } catch (err) {
            setMessage(
                err.response?.data?.error ||
                err.message ||
                "Invalid email or password"
            );
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <h1>Login</h1>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <button type="submit">
                        Login
                    </button>

                </form>

                {message && <p>{message}</p>}

                <p>
                    Don't have an account?
                    <Link to="/register"> Register</Link>
                </p>

            </div>

        </div>
    );
}

export default Login;