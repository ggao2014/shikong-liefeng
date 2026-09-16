'use client';

import { cleanlinessHint, estateEntryButtonsAt, estateHotspotsAt, estateImageAt, houseTierAt, type EstateHotspotId } from './home-catalog';

export function EstateGrounds({
  houseLevel,
  upkeep,
  grounds,
  restEnergy,
  cleanliness,
  staffCount,
  shelterHealth,
  onEnter,
}: {
  houseLevel: number;
  upkeep: number;
  grounds: number;
  restEnergy: number;
  cleanliness: number;
  staffCount: number;
  shelterHealth: number;
  onEnter: (id: EstateHotspotId) => void;
}) {
  const current = houseTierAt(houseLevel);
  const hotspots = estateHotspotsAt(houseLevel);
  const entryButtons = estateEntryButtonsAt(houseLevel);
  return (
    <section className="estate-grounds" aria-label={`地产：Lv.${houseLevel} ${current.name}`}>
      <div className="estate-grounds-board">
        <div className="estate-photo-rail">
          <span><small>周维护</small><b>{upkeep}</b></span>
          <span className={grounds < 35 ? 'alert' : ''}><small>园景</small><b>{Math.round(grounds)}</b></span>
          <span className={houseLevel <= 0 ? 'alert' : ''}><small>休息回复</small><b>{restEnergy.toFixed(1)}</b></span>
        </div>
        <div className="estate-photo-frame">
          <img src={estateImageAt(houseLevel)} alt={`${current.name}地产俯瞰图`} />
          {hotspots.map(spot => (
            <button
              key={spot.id}
              type="button"
              className="hotspot"
              style={{ left: spot.left, top: spot.top, width: spot.width, height: spot.height }}
              onClick={() => onEnter(spot.id)}
              aria-label={`进入${spot.label}`}
            >
              <span>{spot.label}</span>
            </button>
          ))}
        </div>
        <div className="estate-photo-rail">
          <span className={cleanliness < 35 ? 'alert' : ''} data-tip={cleanlinessHint(cleanliness)}><small>清洁</small><b>{Math.round(cleanliness)}</b></span>
          <span><small>雇员</small><b>{staffCount}</b></span>
          <span className={houseLevel <= 0 ? 'alert' : ''}><small>庇护</small><b>{shelterHealth > 0 ? `+${shelterHealth}` : `${shelterHealth}`}</b></span>
        </div>
      </div>
      {entryButtons.length > 0 && (
        <div className="estate-entry-bar">
          {entryButtons.map(entry => (
            <button key={entry.id} type="button" onClick={() => onEnter(entry.id)}>{entry.label}</button>
          ))}
        </div>
      )}
    </section>
  );
}
