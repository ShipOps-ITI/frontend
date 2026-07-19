import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "./ShipMap.css";

const defaultCenter = [24.7136, 46.6753];

function MapBounds({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 1) {
      map.setView([locations[0].currentLatitude, locations[0].currentLongitude], 7);
    }

    if (locations.length > 1) {
      map.fitBounds(locations.map((ship) => [ship.currentLatitude, ship.currentLongitude]), {
        padding: [30, 30],
      });
    }
  }, [locations, map]);

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
        <MapBounds locations={locations} />
        {locations.map((ship) => (
          <CircleMarker
            key={ship.id}
            center={[ship.currentLatitude, ship.currentLongitude]}
            radius={10}
            pathOptions={{ color: "#075985", fillColor: "#38bdf8", fillOpacity: 0.9 }}
          >
            <Popup>
              <strong>{ship.name}</strong><br />
              {ship.currentLatitude.toFixed(4)}, {ship.currentLongitude.toFixed(4)}<br />
              {ship.availabilityState.replace("_", " ")}<br />
              {ship.lastAisUpdateAt ? `AIS updated ${new Date(ship.lastAisUpdateAt).toLocaleString()}` : "No AIS update received"}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {locations.length === 0 && (
        <p className="map-empty-state">No ships on this page have a location yet. Add coordinates manually or wait for an AIS update.</p>
      )}
    </section>
  );
}

export default ShipMap;
