'use strict';

var util = require('util')
var Robin = require('robin-js-sdk')
var Lex = require('lex-sdk')
var moment = require('moment')

function inspect(obj) {
  return util.inspect(obj, false, null)
}

const VALID_ROOMS = [{name: 'Amoy', id: 23207}]

function roomForName(name) {
  return VALID_ROOMS.filter(room => {
    return room.name == name
  })[0] || null
}

function validateRoom(handler) {
  var requestedRoomName = handler.slots.MeetingRoom
  var room = roomForName(requestedRoomName)
  if (room) {
    // TODO: check availability
    handler.attributes.room = room.name
    return true
  } else {
    delete handler.attributes.room
    handler.slots.MeetingRoom = null
    handler.emit(':elicit', 'MeetingRoom', `${requestedRoomName} is not a valid meeting room. Which meeting room would you like?`)
    return false
  }
}

var handlers = {
  'BookMeetingRoom.Dialog': function() {
    if (validateRoom(this)) {
      this.emit(':delegate')
    }
  },

  'BookMeetingRoom.Fulfillment': function() {
    var robin = new Robin(process.env.ROBIN_API_TOKEN)
    var organizationId = process.env.ROBIN_ORGANIZATION_ID
    var locationId = process.env.ROBIN_LOCATION_ID

    var room = roomForName(this.slots.MeetingRoom)
    var timeComponents = this.slots.StartTime.split(":")
    var startDate = moment().hours(timeComponents[0]).minutes(timeComponents[1]);
    var endDate = moment(startDate).add(1, 'hour')

    robin.api.spaces.events.create(room.id, {
      title: "Test Event",
      description: 'HeyOffice Booking',
      start: {
        date_time: startDate.format(),
        time_zone: 'Asia/Singapore'
      },
      end: {
        date_time: endDate.format(),
        time_zone: 'Asia/Singapore'
      }
    }).then((response) => {
      var event = response.getData()
      console.log("Event:", inspect(event))
      this.emit(':tell', `Ok, I've booked ${this.slots.MeetingRoom} for you`);
    }).catch((error) => {
      console.log("Error occurred", inspect(error))
      this.emit(':tell', 'Something went wrong. I was unable to book the room.');
    })
  }

}

module.exports.bookMeetingRoom = (event, context, callback) => {
  console.log("Event = " + inspect(event))
  var lex = Lex.handler(event, context)
  lex.registerHandlers(handlers)
  lex.execute()
};
