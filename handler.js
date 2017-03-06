'use strict';

var util = require('util')
var Robin = require('robin-js-sdk')
var Lex = require('lex-sdk')

function inspect(obj) {
  return util.inspect(obj, false, null)
}

const VALID_ROOMS = ['Amoy']

var handlers = {
  'BookMeetingRoom.Dialog': function() {
    var requestedRoom = this.slots.MeetingRoom
    console.log("requestedRoom:", requestedRoom)
    var validRoom = VALID_ROOMS.filter(room => {
      return room == requestedRoom
    })[0] || null
    console.log("validRoom:", validRoom)
    if (validRoom) {
      this.attributes.MeetingRoom = validRoom
      this.emit(':delegate')
    } else {
      this.emit(':elicit', 'MeetingRoom', `${requestedRoom} is not a valid meeting room. Which meeting room would you like?`)
    }
  },

  'BookMeetingRoom.Fulfillment': function() {
    this.emit(':tell', "Booking meeting rooms is not yet support. Please try again tomorrow.");
  }

}

module.exports.bookMeetingRoom = (event, context, callback) => {
  console.log("Event = " + inspect(event))
  var lex = Lex.handler(event, context)
  lex.registerHandlers(handlers)
  lex.execute()
};
