import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import { getPassList } from './satelliteUtils';

import { Elements } from './elements.js';

export function generatePassList(satellite, observer, startDate, days) {
  if (Meteor.isServer) {
    const elements = Elements.findOne({
      satellite: { $eq: satellite }
    });
    const endDate = moment(startDate).add(days, 'd');
    console.time(`[${satellite}] passlist.generate`);
    const passes = getPassList(elements.lines, observer, startDate, endDate);
    console.timeEnd(`[${satellite}] passlist.generate`);
    return passes;
  }
}
