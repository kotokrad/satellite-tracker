import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http'

export const Elements = new Mongo.Collection('elements');

Meteor.methods({
  'elements.update'() {
    this.unblock();
    const expression = /([A-Z 0-9]*)\s\[.*\n(^.*$)\n(^.*$)/gm;
    const url = 'http://www.celestrak.com/NORAD/elements/noaa.txt';
    try {
      const response = HTTP.get(url);
      const string = response.content.replace(/\r/gm, '');
      let element;
      while (element = expression.exec(string)) {
        const satellite = element[1].toLowerCase().replace(' ', '-');
        Elements.upsert({
          satellite: {
            $eq: satellite,
          }
        }, {
          satellite: satellite,
          lines: [element[2], element[3]],
        });
        console.log(`[TLE update] ${satellite}`);
      }
    } catch (e) {
      console.log(e);
    }
  }
});
