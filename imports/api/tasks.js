import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Fiber from 'fibers';

export function scheduleTrackGeneration(satellite) {
  SyncedCron.add({
    name: `${satellite}.track`,
    schedule: parser => parser.recur().every(2).hour(),
    job() {
      Fiber(() => {
        Meteor.call('tracks.cleanup');
        Meteor.call('tracks.generate', satellite);
      }).run();
    },
  });
}

export function scheduleTLEUpdate() {
  SyncedCron.add({
    name: `TLE update`,
    schedule: parser => parser.recur().every(1).weekOfYear(),
    job() {
      Fiber(() => {
        Meteor.call('elements.update');
      }).run();
    },
  });
}
