import { satellite } from 'satellite.js';

export function toShortDate (normalDate) {
  return Math.round(normalDate / 1000);
}

export function toNormalDate (shortDate) {
  return new Date(shortDate * 1000);
}

export function getPosition(TLE, shortDate) {
  const date = toNormalDate(shortDate)
  const satrec = satellite.twoline2satrec(TLE[0], TLE[1]);
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position;
  const gmst = satellite.gstimeFromDate(date);
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);
  const longitude = positionGd.longitude,
        latitude  = positionGd.latitude,
        height    = positionGd.height;
  const longitudeStr = satellite.degreesLong(longitude),
        latitudeStr  = satellite.degreesLat(latitude);
  return {
    'lat': parseFloat(latitudeStr.toFixed(5)),
    'lng': parseFloat(longitudeStr.toFixed(5)),
    'height': parseFloat(height.toFixed(2)),
    'timestamp': toShortDate(date),
  };
}
