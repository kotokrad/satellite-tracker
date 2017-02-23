import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactInterval from 'react-interval';
import { GoogleMapLoader, GoogleMap } from 'react-google-maps';
import { toShortDate } from '../api/satelliteUtils';

import Satellite from './Satellite';

import { Tracks } from '../api/tracks.js';

class SatelliteMap extends Component {

  constructor() {
    super();
    this.state = {
      intervalTimeout: 240000,
      intervalEnabled: true,
      staticDate: new Date(),
      date: new Date(),
    }
  }

  updateDate() { // TODO: find better way to update db query
    const newDate = new Date();
    this.setState({
      date: newDate,
    });
  }

  renderSatellites() {
    const satelliteList = ['noaa-19'];  // TODO: get list from user's data
    return satelliteList.map((satellite) =>
      <Satellite
        key={satellite}
        satellite={satellite}
        date={this.state.date}
        staticDate={this.state.staticDate}
      />
    );
  }

  renderMap() {
    const firstPoint = this.props.firstPoint;
    if (this.props.loading) {
      return <h3>Loading...</h3>
    }
    return (
        <GoogleMapLoader
          containerElement={<div style={{ height: '100%' }}></div>}
          googleMapElement={
            <GoogleMap
              defaultZoom={2}
              defaultCenter={firstPoint}
              options={{ streetViewControl: false }}
              >
              {this.renderSatellites()}
            </GoogleMap>
          }
        />
    );
  }

  render() {
    return (
      <div className={'map-container'}>
        {this.renderMap()}
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

SatelliteMap.propTypes = {
  firstPoint: PropTypes.object,
}

export default createContainer(() => {
  const staticShortDate = toShortDate(new Date());
  const firstPointHandle = Meteor.subscribe('tracks.firstPoint', staticShortDate);
  const loading = !firstPointHandle.ready();
  const firstPoint = Tracks.findOne({});
  return {
    loading,
    firstPoint,
  };
}, SatelliteMap);
