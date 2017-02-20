import React from 'react';
import {
  Marker,
  Polyline,
  Circle,
} from 'react-google-maps';

export default function Satellite(props) {
  if (!props) {
    console.log('Satellite has no props');
    return <noscript />;
  }
  const satellite = props.satellite;
  const path = props.path || [];
  return (
    <div>
      <Polyline
        mapHolderRef={props.mapHolderRef}
        options={{
          path: path,
          geodesic: true,
          strokeColor: '#ff0000',
          strokeOpacity: 0.7,
          strokeWeight: 2,
        }}
      />
      <Marker
        mapHolderRef={props.mapHolderRef}
        position={satellite.position}
        icon="/images/satellite.png"
      />
      <Circle
        mapHolderRef={props.mapHolderRef}
        options={{
          strokeColor: '#aa0000',
          strokeOpacity: 0.5,
          strokeWeight: 0.5,
          fillColor: '#aa0000',
          fillOpacity: 0.2,
          center: satellite.position,
          radius: satellite.footprint,
        }}
      />
    </div>
  );
}
