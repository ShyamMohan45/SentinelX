'use client';

import '@/lib/leafletIcon'; // 👈 VERY IMPORTANT
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const defaultPosition: [number, number] = [28.6139, 77.2090]; // India

function ClickHandler({ setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function LocationPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (lat: number, lng: number, address: string) => void;
  onClose: () => void;
}) {
  const [position, setPosition] = useState<[number, number]>(defaultPosition);

  const confirmLocation = async () => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`
    );
    const data = await res.json();

    onSelect(
      position[0],
      position[1],
      data.display_name || 'Unknown location'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-background p-6 rounded-xl w-[90%] max-w-2xl">
        <h3 className="text-lg font-semibold mb-3">
          Select Location
        </h3>

        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler setPosition={setPosition} />
          <Marker position={position} />
        </MapContainer>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirmLocation}>
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  );
}