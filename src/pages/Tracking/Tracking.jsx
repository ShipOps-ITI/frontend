import { useCallback, useEffect, useState } from "react";
import ShipMap from "../../components/ShipMap/ShipMap";
import { getShips } from "../../services/ship.service";
import "./Tracking.css";

const formatUpdatedAt = (value) => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not updated yet";

function Tracking() {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadLocations = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const response = await getShips(1, 100);
      setShips(response.data.data ?? []);
      setUpdatedAt(new Date());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load live vessel locations.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations(true);
    const timer = setInterval(() => loadLocations(), 30_000);
    return () => clearInterval(timer);
  }, [loadLocations]);

  const liveShips = ships.filter((ship) => Number.isFinite(ship.currentLatitude) && Number.isFinite(ship.currentLongitude));
  const staleShips = liveShips.filter((ship) => !ship.lastAisUpdateAt || Date.now() - new Date(ship.lastAisUpdateAt).getTime() > 10 * 60 * 1000);

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
        <article><span>Vessels shown</span><strong>{liveShips.length}</strong><small>with a known location</small></article>
        <article><span>Marked at sea</span><strong>{liveShips.filter((ship) => ship.availabilityState === "AT_SEA").length}</strong><small>operational ship status</small></article>
        <article><span>Needs review</span><strong>{staleShips.length}</strong><small>AIS older than 10 minutes</small></article>
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
        <p>The map refreshes automatically every 30 seconds. The tracking worker updates vessel positions every five minutes.</p>
      </section>
    </main>
  );
}

export default Tracking;
