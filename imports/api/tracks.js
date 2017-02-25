import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import moment from 'moment';

import { getPosition, toShortDate } from './satelliteUtils';

import { Elements } from './elements.js';

export const Tracks = new Mongo.Collection('tracks');

if (Meteor.isServer) {
  Meteor.publish('tracks.points', function(date) {
    console.log('publish points');
    const satelliteList = ['noaa-19']; // TODO: get list from user's data
    return Tracks.find({
      satellite: { $in: satelliteList },
      timestamp: { $gte: date - 1530 }
    }, {
      limit: 6120, // TODO: use settings variable
    });
  });

  Meteor.publish('tracks.firstPoint', function(date) {
    console.log('publish first point');
    const satelliteList = ['noaa-19']; // TODO: get list from user's data
    const satellite = satelliteList[0];
    return Tracks.find({
      satellite: { $eq: satellite },
      timestamp: { $eq: date }
    });
  });

  // TODO: publish encoded polyline
  Meteor.publish('tracks.path', function(date) {
    // console.log('publish polyline');
    // const satelliteList = ['noaa-19'];
    // return Tracks.find({
    //   satellite: { $in: satelliteList },
    //   timestamp: { $gte: date }
    // }, {
    //   limit: 6120,
    // });
  });
}


Meteor.methods({
  'tracks.generate'(satellite) {
    console.time(`[${satellite}] tracks.generate`);
    check(satellite, String);
    this.unblock();
    let trackDate;
    const elements = Elements.findOne({
      satellite: { $eq: satellite }
    });
    const lastPoint = Tracks.findOne({
      satellite: { $eq: satellite },
    }, {
      sort: { timestamp: -1 }
    });
    if (lastPoint) {
      const lastDate = lastPoint['timestamp'];
      trackDate = lastDate + 1;
    } else {
      trackDate = toShortDate(moment(new Date()).subtract(1, 'h'));
    }
    const endDate = toShortDate(moment(new Date()).add(3, 'h'));
    console.log(`[${satellite}] generating ${endDate - trackDate} points`);
    while (trackDate < endDate) {
      const position = getPosition(elements.lines, trackDate);
      const { lat, lng, height, timestamp } = position;
      Tracks.insert({
        satellite,
        lat,
        lng,
        height,
        timestamp,
      });
      trackDate += 1;
    }

    console.timeEnd(`[${satellite}] tracks.generate`);
  },
  'tracks.cleanup'() {
    console.time('tracks.cleanup');
    const obsoleteDate = toShortDate(moment(new Date()).subtract(3, 'h'));
    Tracks.remove({
      timestamp: { $lt: obsoleteDate },
    });
    console.timeEnd('tracks.cleanup');
  },
  'tracks.clear'() {
    console.time('tracks.clear');
    Tracks.remove({});
    console.timeEnd('tracks.clear');
  },
});
