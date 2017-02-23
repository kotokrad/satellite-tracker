import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactInterval from 'react-interval';
import { Marker, Polyline, Circle } from 'react-google-maps';
import { toShortDate } from '../api/satelliteUtils';

import { Tracks } from '../api/tracks.js';

class Satellite extends Component {

  static getPosition(track) {
    const diff = toShortDate(new Date) - track[0].timestamp;
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

  constructor(props) {
    super(props);

    this.state = {
      intervalTimeout: 1000,
      intervalEnabled: true,
      position: 0,
      footprint: 0,
    };
  }

  componentWillMount() { // TODO: find better solution to set initial state
    const track = this.props.track;
    let position;
    try {
      position = Satellite.getPosition(track);
    } catch (e) {
      console.log('Error:', e.message);
      this.setState({
        intervalEnabled: false,
      });
      position = track[track.length - 1];
    } finally {
      const footprint = Satellite.getFootprint(position);
      this.setState({
        position,
        footprint,
      });
    }
  }

  updateSatelliteData() {
    const track = this.props.track;
    let position;
    try {
      position = Satellite.getPosition(track);
    } catch (e) {
      console.log('Error:', e.message);
      this.setState({
        intervalEnabled: false,
      });
      position = track[track.length - 1];
    } finally {
      const footprint = Satellite.getFootprint(position);
      this.setState({
        position,
        footprint,
      });
    }
  }

  render () {
    const satellite = this.props.satellite;
    if (this.props.loading) {
      // console.log(`Satellite ${satellite} is loading...`);
      return <noscript />;
    }
    const path = this.props.path;
    const position = this.state.position;
    const footprint = this.state.footprint;
    return (
      <div>
        <Polyline
          mapHolderRef={this.props.mapHolderRef}
          options={{
            path: path,
            geodesic: true,
            strokeColor: '#ff0000',
            strokeOpacity: 0.7,
            strokeWeight: 2,
          }}
        />
        <Marker
          mapHolderRef={this.props.mapHolderRef}
          position={position}
          icon="/images/satellite.png"
        />
        <Circle
          mapHolderRef={this.props.mapHolderRef}
          options={{
            strokeColor: '#aa0000',
            strokeOpacity: 0.5,
            strokeWeight: 0.5,
            fillColor: '#aa0000',
            fillOpacity: 0.2,
            center: position,
            radius: footprint,
          }}
        />
        <ReactInterval
          timeout={this.state.intervalTimeout}
          enabled={this.state.intervalEnabled && !this.props.loading}
          callback={() => {
            this.updateSatelliteData()
          }}
        />
      </div>
    );
  }
}

Satellite.propTypes = {
  tracks: PropTypes.array,
  path: PropTypes.array,
};

export default createContainer((params) => {
  const currentShortDate = toShortDate(params.date);
  const staticShortDate = toShortDate(params.staticDate);
  const tracksHandle = Meteor.subscribe('tracks.points', staticShortDate);
  const loading = !tracksHandle.ready();
  const track = Tracks.find({
    satellite: { $eq: params.satellite },
    timestamp: { $gte: currentShortDate }
  }, {
    sort: { timestamp: 1 },
    limit: 250, // TODO: use settings variable
  });
  const path = Tracks.find({
    satellite: { $eq: params.satellite },
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
}, Satellite);
