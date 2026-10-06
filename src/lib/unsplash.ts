// Photography: Unsplash (https://unsplash.com/license).

export const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

// 3:4 close-up of the same photo, zoomed on a focal point (0–1 coordinates).
export const detail = (id: string, x: number, y: number, zoom: number, width = 1600) =>
  `${unsplash(id, width)}&h=${Math.round((width * 4) / 3)}&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}`;
