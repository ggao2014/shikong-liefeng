'use client';

import { useState } from 'react';

export type TownPlaceId = 'cottage' | 'library' | 'university' | 'station' | 'magicAcademy';

export const townPlaces: {
  id: TownPlaceId;
  label: string;
  person?: string;
  left: string;
  top: string;
  width: string;
  height: string;
}[] = [
  { id: 'university', label: '大学', person: 'noah', left: '3%', top: '4%', width: '27%', height: '34%' },
  { id: 'library', label: '图书馆', person: 'erin', left: '40%', top: '27%', width: '19%', height: '22%' },
  { id: 'cottage', label: '白榛地', left: '66%', top: '3%', width: '28%', height: '30%' },
  { id: 'station', label: '车站', person: 'lian', left: '33%', top: '67%', width: '32%', height: '24%' },
];

export function TownMapView({ onBack, onEnter, magicUnlocked = false }: { onBack?: () => void; onEnter: (id: TownPlaceId) => void; magicUnlocked?: boolean }) {
  const [mountainHintKey, setMountainHintKey] = useState(0);
  const places = [
    ...townPlaces,
    { id: 'magicAcademy' as const, label: magicUnlocked ? '星穹秘法学院' : '远山', left: '38%', top: '0%', width: '24%', height: '25%' },
  ];
  return (
    <section className="town-map" aria-label="榛木镇">
      {onBack && <button type="button" className="btn-ghost room-back map-back" onClick={onBack}>返回</button>}
      <div className="town-map-board">
        <img src="/town-map.png" alt="榛木镇" width={1024} height={682} decoding="async" />
        {!magicUnlocked && mountainHintKey > 0 && <p key={mountainHintKey} className="mountain-whisper" role="status">雾后似乎隐约可见一些建筑，又很快消失了。</p>}
        {places.map(place => (
          <button
            key={place.id}
            type="button"
            className="hotspot"
            style={{ left: place.left, top: place.top, width: place.width, height: place.height }}
            onClick={place.id === 'magicAcademy' && !magicUnlocked ? () => setMountainHintKey(key => key + 1) : () => onEnter(place.id)}
            aria-label={place.id === 'magicAcademy' && !magicUnlocked ? '远山' : `进入${place.label}`}
            aria-disabled={place.id === 'magicAcademy' && !magicUnlocked}
          >
            <span>{place.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
