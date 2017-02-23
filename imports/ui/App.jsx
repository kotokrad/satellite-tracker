import React, { Component } from 'react';

import SatelliteMap from './SatelliteMap.jsx';

export default class App extends Component {

  render() {
    return (
      <div style={{ height: '100%' }}>
        <SatelliteMap />
      </div>
    );
  }
}
