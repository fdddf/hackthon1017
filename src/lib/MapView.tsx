import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlaceMap } from './viz';
import { PLACES, type Day } from './types';

/** Real coordinates, so the distance on screen is the distance he actually travels. */
const COORDS: Record<string, [number, number]> = {
  home: [52.5486, 13.3885], // Gesundbrunnen
  school: [52.5521, 13.3799],
  park: [52.5455, 13.3836], // Volkspark Humboldthain
  hall: [52.5088, 13.4542], // across town — the ninety minutes
};

const SUBTITLE: Record<string, string> = {
  home: 'got home · 5 pins',
  school: 'left · 5 pins',
  park: 'moved · Mon Wed Fri',
  hall: 'moved · Tue Thu',
};

/** Home, school and the park sit within a few streets, so their labels are
 *  pushed apart by hand rather than left to collide. */
const LABEL_DIR: Record<string, string> = {
  home: 'sw',
  school: 'nw',
  park: 'se',
  hall: 'ne',
};

function pin(far: boolean, label: string, dir: string) {
  return L.divIcon({
    className: '',
    html:
      `<div class="pin ${far ? 'far' : 'near'}"><span class="pin-dot"></span>` +
      `<span class="pin-label ${dir}">${label}</span></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/**
 * The map a parent would actually recognise.
 *
 * Tiles come from OpenStreetMap, which means they need the network. The venue
 * wifi is the one thing we know will fail today, so a single tile error drops
 * the whole thing back to the schematic map, which needs nothing.
 */
export function MapView({ week }: { week: Day[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [tilesFailed, setTilesFailed] = useState(false);

  useEffect(() => {
    if (tilesFailed || !hostRef.current) return;

    const map = L.map(hostRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      dragging: true,
    });

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap',
    });
    tiles.on('tileerror', () => setTilesFailed(true));
    tiles.addTo(map);

    for (const place of PLACES) {
      const at = COORDS[place.id];
      if (!at) continue;
      L.marker(at, { icon: pin(place.far, place.label, LABEL_DIR[place.id] ?? 'ne') })
        .addTo(map)
        .bindPopup(`<b>${place.label}</b><br>${SUBTITLE[place.id] ?? ''}`);
    }

    // the hop that explains the week
    L.polyline([COORDS.home, COORDS.hall], {
      color: '#eb6834',
      weight: 2,
      opacity: 0.7,
      dashArray: '4 6',
    }).addTo(map);

    map.fitBounds(L.latLngBounds(Object.values(COORDS)), { padding: [34, 34] });

    // tiles can fail silently rather than erroring; if nothing painted, fall back
    const check = setTimeout(() => {
      const painted = hostRef.current?.querySelectorAll('img.leaflet-tile-loaded').length ?? 0;
      if (painted === 0) setTilesFailed(true);
    }, 4000);

    return () => {
      clearTimeout(check);
      map.remove();
    };
  }, [tilesFailed]);

  if (tilesFailed) {
    return (
      <>
        <PlaceMap places={PLACES} week={week} />
        <p className="muted offline-note">
          Offline — showing the schematic. The pins and the rule are the same.
        </p>
      </>
    );
  }

  return <div className="mapview" ref={hostRef} />;
}
