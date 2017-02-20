import { Meteor } from 'meteor/meteor';
import '../imports/api/tracks.js';

Meteor.startup(() => {
  // code to run on server at startup
  // Meteor.call('tracks.clear');
  Meteor.call('tracks.cleanup');
  Meteor.call('tracks.generate', 'noaa-19');
});
