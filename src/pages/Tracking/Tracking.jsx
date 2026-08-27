import { useCallback, useEffect, useState } from "react";
import ShipMap from "../../components/ShipMap/ShipMap";
import { getShips, getTrackingHealth } from "../../services/ship.service";
import "./Tracking.css";

const formatUpdatedAt = (value) => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not updated yet";

function Tracking() {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [trackingHealth, setTrackingHealth] = useState(null);

  const loadLocations = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const [shipsResponse, healthResponse] = await Promise.all([getShips(1, 100), getTrackingHealth()]);
      setShips(shipsResponse.data.data ?? []);
      setTrackingHealth(healthResponse.data.data ?? null);
      setUpdatedAt(new Date());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load live vessel locations.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = setTimeout(() => loadLocations(true), 0);
    const timer = setInterval(() => loadLocations(), 30_000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(timer);
    };
  }, [loadLocations]);

  const liveShips = ships.filter((ship) => Number.isFinite(ship.currentLatitude) && Number.isFinite(ship.currentLongitude));
  const worker = trackingHealth?.worker;
  const statusCounts = {
    atSea: ships.filter((ship) => ship.availabilityState === "AT_SEA").length,
    docked: ships.filter((ship) => ship.availabilityState === "DOCKED").length,
    maintenance: ships.filter((ship) => ship.availabilityState === "MAINTENANCE").length,
  };

  return (
    <main className="tracking-page">
      <section className="tracking-hero">
        <div>
          <p className="eyebrow">Operations control</p>
          <h1>Live vessel tracking</h1>
          <p>Monitor the latest reported locations for vessels in your operation.</p>
        </div>
        <div className="tracking-actions">
          <span>Updated {formatUpdatedAt(updatedAt)}</span>
          <button type="button" onClick={() => loadLocations(true)} disabled={loading}>{loading ? "Refreshing..." : "Refresh map"}</button>
        </div>
      </section>

      <section className="tracking-summary" aria-label="Tracking summary">
        <article><span>Vessels shown</span><strong>{liveShips.length}</strong><small>with a reported location</small></article>
        <article className="tracking-status-summary">
          <span>Operational status</span>
          <div>
            <div><strong>{statusCounts.atSea}</strong><small>At sea</small></div>
            <div><strong>{statusCounts.docked}</strong><small>Docked</small></div>
            <div><strong>{statusCounts.maintenance}</strong><small>Maintenance</small></div>
          </div>
        </article>
      </section>

      <section className="tracking-worker-status" aria-label="Tracking worker health">
        <div><strong>Tracking worker</strong><span>{worker?.lastSuccessfulApiCallAt ? `Last VesselAPI success: ${new Date(worker.lastSuccessfulApiCallAt).toLocaleString()}` : "No successful VesselAPI update recorded yet."}</span></div>
        <div><strong>{worker?.updatedShipCount ?? 0}</strong><span>ships updated in last poll</span></div>
        <div><strong>{worker?.retryCount ?? 0}</strong><span>retries recorded</span></div>
      </section>

      {error && <p className="error-message">{error}</p>}
      <div className="tracking-map-area">
        <ShipMap ships={ships} />
        {loading && <div className="tracking-map-loading">Loading vessel locations…</div>}
      </div>

      <section className="tracking-legend" aria-label="Map legend">
        <span><i className="legend-dot at-sea" />At sea</span>
        <span><i className="legend-dot docked" />Docked</span>
        <span><i className="legend-dot maintenance" />Maintenance</span>
        <p>The map refreshes automatically every 30 seconds. The tracking worker checks positions every two minutes.</p>
      </section>
    </main>
  );
}

export default Tracking;
