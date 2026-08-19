import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "./ShipMap.css";

const defaultCenter = [24.7136, 46.6753];

const markerColor = (state) => ({
  AT_SEA: "#16a3d8",
  DOCKED: "#7c5ce0",
  MAINTENANCE: "#e59a19",
}[state] || "#1682a7");

const shipIcon = (ship) => L.divIcon({
  className: "ship-icon-wrapper",
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
  html: `<div class="ship-map-marker" style="--ship-color:${markerColor(ship.availabilityState)}">
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path class="ship-marker-shadow" d="M24 43c9 0 16-2.2 16-5s-7-5-16-5-16 2.2-16 5 7 5 16 5Z"/>
      <path class="ship-marker-hull" d="M24 3 37 31l-5 8H16l-5-8L24 3Z"/>
      <path class="ship-marker-deck" d="M24 10v24M18 29h12M20 22h8"/>
    </svg>
  </div>`,
});

function MapBounds({ locations }) {
  const map = useMap();
  const hasSetInitialView = useRef(false);

  useEffect(() => {
    if (hasSetInitialView.current || locations.length === 0) return;

    if (locations.length === 1) {
      map.setView([locations[0].currentLatitude, locations[0].currentLongitude], 7);
    }

    if (locations.length > 1) {
      map.fitBounds(locations.map((ship) => [ship.currentLatitude, ship.currentLongitude]), {
        padding: [30, 30],
      });
    }
    hasSetInitialView.current = true;
  }, [locations, map]);

  return null;
}

function MapResize() {
  const map = useMap();

  useEffect(() => {
    // Leaflet can measure a zero-width container while a routed page is mounting.
    // Recalculate after paint so the map remains visible when opening Tracking.
    const timer = window.setTimeout(() => map.invalidateSize(), 100);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

function ShipMap({ ships }) {
  const locations = ships.filter(
    (ship) => Number.isFinite(ship.currentLatitude) && Number.isFinite(ship.currentLongitude)
  );

  return (
    <section className="ship-map-card">
      <div className="list-heading">
        <h2>Live ship locations</h2>
        <span>{locations.length}</span>
      </div>

      <MapContainer center={defaultCenter} zoom={5} className="ship-map" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResize />
        <MapBounds locations={locations} />
        {locations.map((ship) => (
          <Marker
            key={ship.id}
            center={[ship.currentLatitude, ship.currentLongitude]}
            icon={shipIcon(ship)}
          >
            <Popup>
              <strong>{ship.name}</strong><br />
              {ship.currentLatitude.toFixed(4)}, {ship.currentLongitude.toFixed(4)}<br />
              {ship.availabilityState.replace("_", " ")}<br />
              {ship.lastAisUpdateAt ? `AIS updated ${new Date(ship.lastAisUpdateAt).toLocaleString()}` : "No AIS update received"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {locations.length === 0 && (
        <p className="map-empty-state">No ships on this page have a location yet. Add coordinates manually or wait for an AIS update.</p>
      )}
    </section>
  );
}

export default ShipMap;
