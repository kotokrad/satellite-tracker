import { Meteor } from 'meteor/meteor';
import '../imports/api/tracks.js';
import '../imports/api/elements.js';
import { scheduleTrackGeneration, scheduleTLEUpdate } from '../imports/api/tasks';

import { Elements } from '../imports/api/elements.js';

const satelliteList = ['noaa-16', 'noaa-19']; // TODO: get list from elements collection:
// Elements.rawCollection().distinct('satellite').then(result => {
//   console.log(result);
// });

Meteor.startup(() => {
  // code to run on server at startup
  // Meteor.call('tracks.clear');
  Meteor.call('elements.update')
  Meteor.call('tracks.cleanup');
  scheduleTLEUpdate();
  satelliteList.forEach(satellite => {
    Meteor.call('tracks.generate', satellite);
    scheduleTrackGeneration(satellite)
  });
  SyncedCron.start();
});
