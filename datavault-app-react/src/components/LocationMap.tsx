import { useEffect } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

type LocationPoint = {
  id: number;
  label: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
};

function FitMapToRoute({ locations }: { locations: LocationPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) {
      return;
    }

    const bounds = locations.map((point) => [point.latitude, point.longitude]) as [
      number,
      number,
    ][];
    map.fitBounds(bounds, {
      padding: [40, 40],
    });
  }, [locations, map]);

  return null;
}

export function LocationMap({
  locations,
  isLoading,
  emptyMessage,
}: {
  locations: LocationPoint[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  if (isLoading) {
    return (
      <div className="flex h-[32rem] items-center justify-center rounded-[1.5rem] bg-slate-100 text-sm text-slate-500">
        Loading map data...
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex h-[32rem] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  const positions = locations.map((point) => [point.latitude, point.longitude]) as [
    number,
    number,
  ][];

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
      <MapContainer
        center={positions[0]}
        zoom={12}
        scrollWheelZoom
        className="h-[32rem] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitMapToRoute locations={locations} />
        <Polyline positions={positions} pathOptions={{ color: "#0f766e", weight: 4 }} />
        {locations.map((point, index) => (
          <CircleMarker
            key={point.id}
            center={[point.latitude, point.longitude]}
            radius={index === locations.length - 1 ? 8 : 6}
            pathOptions={{
              color: index === locations.length - 1 ? "#0f172a" : "#164e63",
              fillColor: index === locations.length - 1 ? "#f59e0b" : "#14b8a6",
              fillOpacity: 0.95,
              weight: 2,
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{point.label}</p>
                <p>{new Date(point.recorded_at).toLocaleString()}</p>
                <p>
                  {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
