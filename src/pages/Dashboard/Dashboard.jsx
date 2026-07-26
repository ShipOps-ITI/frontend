import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getStatistics } from "../../services/dashboard.service";
import "./Dashboard.css";

const STATUS_COLORS = {
  Delivered: "#12b76a",
  Delayed: "#f04438",
  "In Transit": "#2e90fa",
  InTransit: "#2e90fa",
  Pending: "#f79009",
  Loaded: "#7f56d9",
};

const statusClass = (status = "") => status.toLowerCase().replaceAll(" ", "-");
const formatDate = (value) => value ? new Date(value).toLocaleString() : "—";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => { loadStatistics(); }, []);

  async function loadStatistics(manual = false) {
    try {
      manual ? setRefreshing(true) : setLoading(true);
      setError("");
      const response = await getStatistics();
      setStats(response.data);
      setUpdatedAt(new Date());
    } catch {
      setError("Unable to retrieve dashboard statistics. Check that Document Dashboard is running on port 5003.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) return <main className="dashboard-page"><p className="dashboard-state">Loading your operations overview…</p></main>;

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-empty-state">
          <p className="eyebrow">Operations overview</p>
          <h1>Dashboard unavailable</h1>
          <p>{error}</p>
          <button type="button" onClick={() => loadStatistics(true)}>Try again</button>
        </section>
      </main>
    );
  }

  const ships = stats?.latestShips ?? [];
  const shipments = stats?.latestShipments ?? [];
  const charts = stats?.charts ?? {};
  const delayedCount = Number(stats?.delayedShips ?? 0);
  const pendingCount = Number(stats?.pendingShipments ?? 0);
  const kpis = [
    { label: "Fleet vessels", value: stats?.totalShips ?? 0, detail: `${stats?.shipsInTransit ?? 0} currently in transit`, tone: "blue" },
    { label: "Open shipments", value: stats?.totalShipments ?? 0, detail: `${pendingCount} awaiting progress`, tone: "violet" },
    { label: "Delivered", value: stats?.deliveredShipments ?? 0, detail: "Completed shipments", tone: "green" },
    { label: "Needs attention", value: delayedCount, detail: delayedCount ? "Delayed vessel(s) require review" : "No delayed vessels", tone: delayedCount ? "red" : "green" },
  ];

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Operations control tower</p>
          <h1>Fleet overview</h1>
          <p>Prioritize exceptions, monitor movement, and act on the latest shipment activity.</p>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="secondary-button" onClick={() => loadStatistics(true)} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" onClick={() => navigate("/shipments")}>View shipments</button>
        </div>
      </section>

      <section className="dashboard-kpis" aria-label="Operations summary">
        {kpis.map((kpi) => (
          <article className={`dashboard-kpi ${kpi.tone}`} key={kpi.label}>
            <p>{kpi.label}</p>
            <strong>{kpi.value}</strong>
            <span>{kpi.detail}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-workspace">
        <article className="dashboard-panel attention-panel">
          <div className="panel-heading">
            <div><p className="panel-kicker">Exceptions</p><h2>Needs attention</h2></div>
            <span className={delayedCount ? "attention-count urgent" : "attention-count"}>{delayedCount + pendingCount}</span>
          </div>
          {delayedCount || pendingCount ? (
            <div className="exception-list">
              {delayedCount > 0 && <button type="button" onClick={() => navigate("/ships")}><span className="status-dot delayed" />{delayedCount} delayed vessel(s)<small>Review vessel availability and latest AIS update</small></button>}
              {pendingCount > 0 && <button type="button" onClick={() => navigate("/shipments")}><span className="status-dot pending" />{pendingCount} pending shipment(s)<small>Confirm planned movement and next milestone</small></button>}
            </div>
          ) : <p className="empty-panel">No active exceptions. Your fleet is operating normally.</p>}
        </article>

        <article className="dashboard-panel activity-panel">
          <div className="panel-heading"><div><p className="panel-kicker">Live activity</p><h2>Latest shipments</h2></div><button type="button" className="text-button" onClick={() => navigate("/shipments")}>Open list</button></div>
          {shipments.length ? <div className="activity-list">{shipments.slice(0, 4).map((shipment) => <button type="button" key={shipment.id} onClick={() => navigate(`/shipments/${shipment.id}`)}><span><strong>{shipment.customer || "Unassigned customer"}</strong><small>Shipment #{shipment.id} · Vessel #{shipment.ship_id ?? "—"}</small></span><em className={`status-badge ${statusClass(shipment.status)}`}>{shipment.status}</em></button>)}</div> : <p className="empty-panel">No shipments have been created yet.</p>}
        </article>
      </section>

      <section className="dashboard-data-grid">
        <article className="dashboard-panel chart-panel">
          <div className="panel-heading"><div><p className="panel-kicker">Fleet health</p><h2>Vessels by status</h2></div></div>
          <ResponsiveContainer width="100%" height={270}>
            <PieChart><Pie data={charts.shipsByStatus ?? []} dataKey="count" nameKey="status" innerRadius={58} outerRadius={88} paddingAngle={3}>{(charts.shipsByStatus ?? []).map((item) => <Cell key={item.status} fill={STATUS_COLORS[item.status] || "#98a2b3"} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </article>
        <article className="dashboard-panel chart-panel">
          <div className="panel-heading"><div><p className="panel-kicker">Shipment flow</p><h2>Shipments by status</h2></div></div>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={charts.shipmentsByStatus ?? []} margin={{ left: -16 }}><CartesianGrid vertical={false} stroke="#e7edf4" /><XAxis dataKey="status" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f4f8fc" }} /><Bar dataKey="count" fill="#16759a" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="dashboard-panel vessel-panel">
        <div className="panel-heading"><div><p className="panel-kicker">Fleet activity</p><h2>Recently updated vessels</h2></div><button type="button" className="text-button" onClick={() => navigate("/ships")}>View ships</button></div>
        {ships.length ? <div className="vessel-table"><div className="vessel-table-head"><span>Vessel</span><span>Status</span><span>Latest ETA</span></div>{ships.map((ship) => <div className="vessel-table-row" key={ship.id}><strong>{ship.name}</strong><span><em className={`status-badge ${statusClass(ship.status)}`}>{ship.status || "Unknown"}</em></span><span>{formatDate(ship.eta)}</span></div>)}</div> : <p className="empty-panel">No vessels are available yet.</p>}
      </section>

      {updatedAt && <p className="dashboard-updated">Last refreshed {updatedAt.toLocaleTimeString()}.</p>}
    </main>
  );
}

export default Dashboard;
