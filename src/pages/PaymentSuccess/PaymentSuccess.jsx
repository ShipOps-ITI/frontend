import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPremiumPayment, getSubscription } from "../../services/subscription.service";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({
    status: "verifying",
    message: "We are securely verifying your payment with Paymob.",
  });

  useEffect(() => {
    let cancelled = false;
    const transactionId = searchParams.get("id") || searchParams.get("transaction_id");

    const verify = async () => {
      try {
        const result = transactionId
          ? await confirmPremiumPayment(transactionId)
          : { subscription: await getSubscription() };
        if (cancelled) return;

        if (result.subscription?.status === "ACTIVE") {
          setState({ status: "active", message: "Your annual ShipOps workspace is active." });
        } else {
          setState({ status: "pending", message: "Paymob is still confirming the transaction. Please retry in a moment." });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error.response?.data?.error || "We could not verify this payment yet.",
          });
        }
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [searchParams]);

  const active = state.status === "active";
  return <main className="payment-success-page">
    <section className="payment-success-card">
      <div className="success-icon" aria-hidden="true">{active ? "✓" : "…"}</div>
      <p className="success-eyebrow">{active ? "PAYMENT VERIFIED" : "PAYMENT VERIFICATION"}</p>
      <h1>{active ? "Your subscription is active." : "Confirming your payment."}</h1>
      <p>{state.message}</p>
      {active
        ? <button className="success-cta" type="button" onClick={() => navigate("/dashboard", { replace: true })}>Open ShipOps dashboard</button>
        : <button className="success-cta" type="button" onClick={() => window.location.reload()}>Retry verification</button>}
    </section>
  </main>;
}

export default PaymentSuccess;
