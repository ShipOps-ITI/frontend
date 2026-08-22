import { Link } from "react-router-dom";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  return <main className="payment-success-page">
    <section className="payment-success-card">
      <div className="success-icon" aria-hidden="true">✓</div>
      <p className="success-eyebrow">PAYMENT COMPLETE</p>
      <h1>Payment completed successfully.</h1>
      <p>Thank you for subscribing to ShipOps Premium. Your membership is being activated now.</p>
      <Link className="success-cta" to="/subscription">View my subscription</Link>
    </section>
  </main>;
}

export default PaymentSuccess;
