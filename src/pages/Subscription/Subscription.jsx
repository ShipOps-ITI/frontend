import { useEffect, useState } from "react";
import { activateFreePlan, cancelSubscription, getSubscription, startPremiumCheckout } from "../../services/subscription.service";
import { getUser } from "../../services/auth.service";
import "./Subscription.css";

function Subscription() {
  const user = getUser();
  const [subscription, setSubscription] = useState(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reload = () => getSubscription().then(setSubscription).catch((err) => setError(err.response?.data?.error || "Could not load subscription"));
  useEffect(() => { reload(); }, []);

  const selectFree = async () => {
    setLoading(true); setError("");
    try { await activateFreePlan(); await reload(); } catch (err) { setError(err.response?.data?.error || "Could not activate Free"); } finally { setLoading(false); }
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
    <section className="subscription-hero"><p>SHIPOPS MEMBERSHIP</p><h1>Choose the plan that fits your operation.</h1><span>Premium renews monthly. You can cancel at any time.</span></section>
    {error && <p className="error-message">{error}</p>}
    {subscription && <p className="subscription-status">Current plan: <strong>{subscription.plan}</strong> · {subscription.status}</p>}
    <section className="plans-grid">
      <article className="plan-card"><h2>Free</h2><p className="price">$0 <small>/ month</small></p><p>Access to the core ShipOps workspace.</p><button className="secondary-button" disabled={loading || subscription?.plan === "FREE"} onClick={selectFree}>{subscription?.plan === "FREE" ? "Current plan" : "Choose Free"}</button></article>
      <article className="plan-card featured"><span className="plan-badge">RECOMMENDED</span><h2>Premium</h2><p className="price">$100 <small>/ month</small></p><p>Recurring monthly subscription through a secure Paymob checkout.</p><label htmlFor="billing-phone">Phone number</label><input id="billing-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+2010..." autoComplete="tel" /><button disabled={loading} onClick={selectPremium}>{subscription?.status === "PENDING" ? "Resume secure payment" : "Continue to secure payment"}</button>{subscription?.plan === "PREMIUM" && subscription?.status === "ACTIVE" && <button className="text-button cancel-plan" disabled={loading} onClick={cancel}>Cancel Premium</button>}</article>
    </section>
  </main>;
}

export default Subscription;
