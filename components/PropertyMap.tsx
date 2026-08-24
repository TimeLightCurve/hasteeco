"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { Property } from "@/lib/properties";

type Props = {
  properties: Property[];
  selectedSlug?: string;
  onSelect: (slug: string) => void;
};

export default function PropertyMap({ properties, selectedSlug, onSelect }: Props) {
  const center: [number, number] = properties.length
    ? [properties[0].location.coordinates.latitude, properties[0].location.coordinates.longitude]
    : [32.4279, 53.688];

  return (
    <MapContainer center={center} zoom={6} scrollWheelZoom className="h-full w-full" attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FitProperties properties={properties} />
      {properties.map((property) => {
        const selected = property.slug === selectedSlug;
        return (
          <Marker
            key={property.slug}
            position={[property.location.coordinates.latitude, property.location.coordinates.longitude]}
            icon={createPin(selected)}
            eventHandlers={{ click: () => onSelect(property.slug) }}
            zIndexOffset={selected ? 1000 : 0}
          >
            <Tooltip direction="top" offset={[100, -20]} opacity={1}>{property.titleFa}</Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

function FitProperties({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (!properties.length) return;
    if (properties.length === 1) {
      map.setView([properties[0].location.coordinates.latitude, properties[0].location.coordinates.longitude], 13);
      return;
    }
    const bounds = L.latLngBounds(properties.map((property) => [property.location.coordinates.latitude, property.location.coordinates.longitude]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  }, [map, properties]);
  return null;
}

function createPin(selected: boolean) {
  return L.divIcon({
    className: "property-map-pin",
    html: `<span class="${selected ? "is-selected" : ""}"><i></i></span>`,
    iconSize: [38, 48],
    iconAnchor: [19, 46],
    tooltipAnchor: [0, -42],
  });
}
