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
  if (!requestedRoomName) {
    return true
  }

  var room = roomForName(requestedRoomName)
  if (room) {
    // TODO: check availability
    return true
  } else {
    delete handler.attributes.room
    handler.slots.MeetingRoom = null
    handler.emit(':elicit', 'MeetingRoom', `${requestedRoomName} is not a valid meeting room. Which meeting room would you like?`)
    return false
  }
}

function validateNumPeople(handler) {
  var numPeople = handler.slots.NumPeople
  if (numPeople) {
    if (numPeople < 0) {
      handler.slots.NumPeople = null
      handler.emit(':elicit', 'NumPeople', `You cannot have a negative amount of people in a meeting! How many people will be attending?`)
      return false
    }
    if (numPeople > 12) {
      handler.slots.NumPeople = null
      handler.emit(':elicit', 'NumPeople', `We don't have any rooms that can fit more than 12 people. I'll set the number of attendees to 12. Is this ok?`)
      return false
    }
  }
  return true
}

function validateStartTime(handler) {
  var startTime = handler.slots.StartTime
  var date = handler.slots.Date
  if (startTime && date) {
    var timeComponents = startTime.split(":")
    var dateTime = moment(date).hours(timeComponents[0]).minutes(timeComponents[1])
    if (dateTime.diff(moment(), 'hours') < 0) {
      handler.emit(':elicit', 'StartTime', `Unless you're a time traveller there's not much point booking for ${startTime}. When do you need the room?`)
      return false
    }
  }
  if (startTime) {
    var timeComponents = startTime.split(":")
    var dateTime = moment().hours(timeComponents[0]).minutes(timeComponents[1])
    if (dateTime.diff(moment(), 'hours') < 0) {
      handler.emit(':elicit', 'Date', "On what day do you need the room?")
      return false
    }
  }
  return true
}

var handlers = {
  'BookMeetingRoom.Dialog': function() {
    if (validateStartTime(this) && validateNumPeople(this) && validateRoom(this)) {
      if (this.slots.StartTime && this.slots.NumPeople) {
        // TODO: find appropriate room and check availability
      }
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
