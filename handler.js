'use strict';

var util = require('util')
var Robin = require('robin-js-sdk')
var Lex = require('lex-sdk')

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
    handler.attributes.room = room
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

    robin.api.spaces.events.post(this.attributes.room.id, {
      title: "Test Event",
      start: {
        date_time: '',
        time_zone: ''
      },
      end: {
        date_time: '',
        time_zone: ''
      },
      description: '',
      visibility: '',
      recurrence: '',
      // invitees: [{email: '', name: ''}]
    }).then(function(response) {
      var data = response.getData()
      console.log("Spaces = " + inspect(data))
    })

    this.emit(':tell', "Booking meeting rooms is not yet support. Please try again tomorrow.");
  }

}

module.exports.bookMeetingRoom = (event, context, callback) => {
  console.log("Event = " + inspect(event))
  var lex = Lex.handler(event, context)
  lex.registerHandlers(handlers)
  lex.execute()
};
