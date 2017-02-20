import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import ReactInterval from 'react-interval';
import { toShortDate } from '../api/satelliteUtils';

import SatelliteMap from './SatelliteMap.jsx';

export default class App extends Component {

  constructor() {
    super();

    this.state = {
      intervalTimeout: 240000,
      intervalEnabled: true,
      date: new Date(),
      staticDate: new Date(),
    }
  }

  updateDate() { // TODO: find better way to update db query
    const newDate = new Date();
    this.setState({
      date: newDate,
      updateCounter: 0,
    });
  }

  render() {
    console.log('re-render');
    return (
      <div style={{ height: '100%' }}>
        <SatelliteMap date={this.state.date} staticDate={this.state.staticDate} />
        <ReactInterval
          timeout={this.state.intervalTimeout}
          enabled={this.state.intervalEnabled}
          callback={() => {
            this.updateDate()
          }}
        />
      </div>
    );
  }
}
