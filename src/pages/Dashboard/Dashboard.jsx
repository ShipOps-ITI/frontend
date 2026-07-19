import { useEffect, useState } from "react";
import { getStatistics } from "../../services/dashboard.service";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import "./Dashboard.css";

function getStatusClass(status) {
  switch (status) {
    case "Delivered":
      return "status delivered";

    case "Delayed":
      return "status delayed";

    case "In Transit":
      return "status transit";

    case "Pending":
      return "status pending";

    default:
      return "status";
  }
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStatistics();
  }, []);

  async function loadStatistics() {
    try {
      setLoading(true);
      setError("");

      const response = await getStatistics();
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <h2 className="loading-message">
          Loading dashboard statistics...
        </h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <h2 className="error-message">{error}</h2>
      </main>
    );
  }

  return (
    <main className="dashboard-page">

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">ShipOps</p>
          <h1>Dashboard</h1>
          <p>Monitor fleet activity and shipment statistics.</p>
        </div>
      </section>

      <section className="stats-grid">

        <div className="stat-card">
          <h3>Total Ships</h3>
          <p>{stats.totalShips}</p>
        </div>

        <div className="stat-card">
          <h3>Ships In Transit</h3>
          <p>{stats.shipsInTransit}</p>
        </div>

        <div className="stat-card">
          <h3>Delayed Ships</h3>
          <p>{stats.delayedShips}</p>
        </div>

        <div className="stat-card">
          <h3>Total Shipments</h3>
          <p>{stats.totalShipments}</p>
        </div>

        <div className="stat-card">
          <h3>Delivered Shipments</h3>
          <p>{stats.deliveredShipments}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Shipments</h3>
          <p>{stats.pendingShipments}</p>
        </div>

      </section>

      <section className="tables">

        <div className="table-card">

          <h2>Latest Ships</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>ETA</th>
              </tr>
            </thead>

            <tbody>
              {stats.latestShips.map((ship) => (
                <tr key={ship.id}>
                  <td>{ship.name}</td>
                  <td>
                    <span className={getStatusClass(ship.status)}>
                    {ship.status}
                    </span>
                  </td>
                  <td>{new Date(ship.eta).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

        <div className="table-card">

          <h2>Latest Shipments</h2>

          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Ship ID</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {stats.latestShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.customer}</td>
                  <td>{shipment.ship_id}</td>
                  <td>
                    <span className={getStatusClass(shipment.status)}>
                    {shipment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </section>

      <section className="charts-container">

  <div className="chart-card">

    <h2>
      Ships By Status
    </h2>

    <ResponsiveContainer width="100%" height={300}>

      <PieChart>

        <Pie
          data={stats.charts.shipsByStatus}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >

          {stats.charts.shipsByStatus.map((entry, index) => (
            <Cell key={index} />
          ))}

        </Pie>

        <Tooltip />

        <Legend />

      </PieChart>

    </ResponsiveContainer>

  </div>



  <div className="chart-card">

    <h2>
      Shipments By Status
    </h2>


    <ResponsiveContainer width="100%" height={300}>

      <BarChart
        data={stats.charts.shipmentsByStatus}
      >

        <CartesianGrid />

        <XAxis dataKey="status" />

        <YAxis />

        <Tooltip />

        <Legend />

        <Bar
          dataKey="count"
        />

      </BarChart>


    </ResponsiveContainer>


  </div>


</section>

    </main>
  );
}

export default Dashboard;