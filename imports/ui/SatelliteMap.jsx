import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactInterval from 'react-interval';
import {
  GoogleMapLoader,
  GoogleMap,
} from 'react-google-maps';
import moment from 'moment';
import update from 'immutability-helper';
import { toShortDate } from '../api/satelliteUtils';

import Satellite from './Satellite';

import { Tracks } from '../api/tracks.js';

class SatelliteMap extends Component {

  static getPosition(track) {
    const diff = Math.round(new Date() / 1000) - track[0].timestamp;
    const position = track[diff];
    if (position) {
      return position;
    } else {
      throw new Error("Obsolete track");
    }
  }

  static getFootprint(position) {
    const EARTH_RADIUS = 6371;
    const tangent = Math.sqrt(position.height
                      * (position.height + (2 * EARTH_RADIUS)));
    const centerAngle = Math.asin(tangent / (position.height + EARTH_RADIUS));
    const footprint = (centerAngle * EARTH_RADIUS) * 1000;
    return footprint;
  }

  constructor() {
    super();

    const defaultPosition = {
      lat: 48,
      lng: 37.43,
    };
    this.state = {
      intervalTimeout: 1000,
      intervalEnabled: true,
      intervalCount: 0,
      satelliteList: ['noaa-19'],
      satelliteDetails: {
        'noaa-19': {
          track: [],
          position: defaultPosition,
          footprint: 0,
        }
      },
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      satelliteDetails: update(this.state.satelliteDetails, {
        'noaa-19': {
          track: {
            $set: newProps.track,
          }
        }
      })
    });
  }

  updateSatelliteData(satellite) { // FIXME: runs even if this.state.intervalEnabled is false
    const track = this.state.satelliteDetails['noaa-19'].track;
    let position;
    try {
      position = SatelliteMap.getPosition(track);
    } catch (e) {
      console.log('Error:', e.message);
      this.setState({
        intervalEnabled: false,
      });
      position = track[track.length - 1];
    } finally {
      const footprint = SatelliteMap.getFootprint(position);
      this.setState({
        satelliteDetails: update(this.state.satelliteDetails, {
          [satellite]: {
            position: {
              $set: position,
            },
            footprint: {
              $set: footprint,
            }
          },
        }),
      });
    }
  }

  renderSatellites() {
    if (!this.props.loading) {
      const satelliteDetails = this.state.satelliteDetails;
      const satelliteList = this.state.satelliteList;
      return satelliteList.map((satellite) =>
        <Satellite
          key={satellite}
          path={this.props.path}
          track={this.props.track}
          satellite={satelliteDetails[satellite]}
        />
      );
    } else {
      console.log('loading');
    }
  }

  renderMap() {
    const track = this.state.satelliteDetails['noaa-19'].track;
    if (!track.length || !track[0]) {
      return <h3>Loading...</h3>
    }
    return (
        <GoogleMapLoader
          containerElement={<div style={{ height: '100%' }}></div>}
          googleMapElement={
            <GoogleMap
              defaultZoom={2}
              defaultCenter={track[0]}
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
          enabled={this.state.intervalEnabled && !this.props.loading}
          callback={() => {
            this.updateSatelliteData(this.state.satelliteList[0])
          }}
        />
      </div>
    );
  }
}

SatelliteMap.propTypes = {
  track: PropTypes.array.isRequired,
  path: PropTypes.array,
}


export default createContainer((params) => {
  const currentShortDate = toShortDate(params.date);
  const staticShortDate = toShortDate(params.staticDate);
  const tracksHandle = Meteor.subscribe('tracks.points', staticShortDate);
  const loading = !tracksHandle.ready();
  const track = Tracks.find({
    satellite: { $eq: 'noaa-19' },
    timestamp: { $gte: currentShortDate }
  }, {
    sort: { timestamp: 1 },
    limit: 250, // TODO: use settings variable
  });
  const path = Tracks.find({
    satellite: { $eq: 'noaa-19' },
    timestamp: {
      $mod: [60, 0], // TODO: use settings variable
    }
  }, {
    sort: { timestamp: 1 },
  });
  return {
    loading,
    track: track.fetch(),
    path: path.fetch(),
  };
}, SatelliteMap);
