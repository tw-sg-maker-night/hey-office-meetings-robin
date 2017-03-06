'use strict';

var util = require('util')
var Robin = require('robin-js-sdk')
var Lex = require('lex-sdk')

function inspect(obj) {
  return util.inspect(obj, false, null)
}

var handlers = {
  'BookMeetingRoom': function() {
    var robin = new Robin(process.env.ROBIN_API_TOKEN)
    var organizationId = process.env.ROBIN_ORGANIZATION_ID
    var locationId = process.env.ROBIN_LOCATION_ID

    robin.api.locations.spaces.get(locationId).then(function(response) {
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
