import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { activateTrial, cancelSubscription, getSubscription, startPremiumCheckout } from "../../services/subscription.service";
import { getUser } from "../../services/auth.service";
import "./Subscription.css";

const getTrialDaysRemaining = (subscription) => {
  if (subscription?.plan !== "TRIAL" || subscription?.status !== "TRIALING" || !subscription.endsAt) return null;
  return Math.max(0, Math.ceil((new Date(subscription.endsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
};

function Subscription() {
  const user = getUser();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const trialDaysRemaining = getTrialDaysRemaining(subscription);

  const reload = () => getSubscription().then(setSubscription).catch((err) => setError(err.response?.data?.error || "Could not load subscription"));
  useEffect(() => { reload(); }, []);

  const selectTrial = async () => {
    setLoading(true); setError("");
    try { await activateTrial(); await reload(); navigate("/dashboard", { replace: true }); } catch (err) { setError(err.response?.data?.error || "Could not activate your trial"); } finally { setLoading(false); }
  };
  const selectPremium = async () => {
    if (!phone.trim()) return setError("Enter your phone number before checkout.");
    setLoading(true); setError("");
    const names = (user?.name || "ShipOps User").trim().split(/\s+/);
    try {
      const { checkoutUrl } = await startPremiumCheckout({ first_name: names[0], last_name: names.slice(1).join(" ") || "User", email: user?.email, phone_number: phone.trim(), country: "EGY" });
      window.location.assign(checkoutUrl);
    } catch (err) { setError(err.response?.data?.error || "Could not start secure checkout"); setLoading(false); }
  };
  const cancel = async () => {
    setLoading(true); setError("");
    try { await cancelSubscription(); await reload(); } catch (err) { setError(err.response?.data?.error || "Could not cancel subscription"); } finally { setLoading(false); }
  };

  return <main className="subscription-page">
    <section className="subscription-hero"><p>WORKSPACE ACCESS</p><h1>Start with a trial or subscribe yearly.</h1><span>Try every core ShipOps feature for 30 days, or activate annual access through secure Paymob checkout.</span></section>
    {error && <p className="error-message">{error}</p>}
    {subscription && <p className="subscription-status">Current plan: <strong>{subscription.plan}</strong> · {subscription.status}</p>}
    {trialDaysRemaining !== null && <section className="trial-remaining" aria-label="Trial remaining time">
      <div><span>Trial access active</span><strong>{trialDaysRemaining} {trialDaysRemaining === 1 ? "day" : "days"} remaining</strong></div>
      <p>Your workspace trial ends on {new Date(subscription.endsAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}.</p>
    </section>}
    <section className="plans-grid">
      <article className="plan-card"><span className="plan-label">EXPLORE</span><h2>30-day trial</h2><p className="price">$0 <small>for 30 days</small></p><ul><li>Fleet and vessel management</li><li>Shipments, ports, and documents</li><li>Tracking and operations dashboard</li></ul><button className="secondary-button" disabled={loading || !subscription?.trialAvailable || subscription?.plan === "TRIAL"} onClick={selectTrial}>{subscription?.plan === "TRIAL" ? "Trial active" : subscription?.trialAvailable ? "Start 30-day trial" : "Trial already used"}</button></article>
      <article className="plan-card featured"><span className="plan-badge">FULL ACCESS</span><span className="plan-label">ANNUAL</span><h2>ShipOps yearly</h2><p className="price">EGP 100 <small>/ year</small></p><ul><li>Continuous workspace access</li><li>Secure annual Paymob billing</li><li>One-year access; renew when you choose</li></ul><label htmlFor="billing-phone">Billing phone number</label><input id="billing-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+2010..." autoComplete="tel" /><button disabled={loading} onClick={selectPremium}>{subscription?.plan === "PREMIUM" && subscription?.status === "PENDING" ? "Resume secure payment" : "Continue to secure payment"}</button>{subscription?.plan === "PREMIUM" && subscription?.status === "ACTIVE" && <button className="text-button cancel-plan" disabled={loading} onClick={cancel}>Cancel annual plan</button>}</article>
    </section>
  </main>;
}

export default Subscription;
