import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import moment from 'moment';

import { getPosition, toShortDate } from './satelliteUtils';

export const Tracks = new Mongo.Collection('tracks');

// export const TRACK_COUNT = 6120;
export const TLE = [
  '1 33591U 09005A   17027.91057759 +.00000097 +00000-0 +77621-4 0  9998',
  '2 33591 099.0737 352.8899 0013289 309.7801 050.2199 14.12148166410592'
];
// const DEFAULT_SAT = 'noaa-19';

if (Meteor.isServer) {
  Meteor.publish('tracks.points', function(date) {
    console.log('publish points');
    const satelliteList = ['noaa-19']; // TODO: get list from user's data
    return Tracks.find({
      satellite: { $in: satelliteList },
      timestamp: { $gte: date - 1530 }
    }, {
      limit: 6120, // TODO: declare const
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
    console.time('tracks.generate');
    check(satellite, String);

    let trackDate;
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
    console.log(`generating ${endDate - trackDate} points`);
    while (trackDate < endDate) {
      const position = getPosition(TLE, trackDate);
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

    console.timeEnd('tracks.generate');
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
