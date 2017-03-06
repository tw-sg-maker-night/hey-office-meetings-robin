'use strict';

var util = require('util')
var Robin = require('robin-js-sdk')

function inspect(obj) {
  return util.inspect(obj, false, null)
}

// This is a hack. We should create a proper library that handles
// the formatting for valid Lax responses.
function responseWithContent(content) {
    return {
        sessionAttributes: {},
        dialogAction: {
            type: "Close",
            fulfillmentState: "Fulfilled",
            message: {
                contentType: "PlainText",
                content: content
            }
        }
    }
}

module.exports.bookMeetingRoom = (event, context, callback) => {
  console.log("Event = " + inspect(event))

  var robin = new Robin(process.env.ROBIN_API_TOKEN)
  var organizationId = process.env.ROBIN_ORGANIZATION_ID
  var locationId = process.env.ROBIN_LOCATION_ID

  robin.api.locations.spaces.get(locationId).then(function(response) {
    var data = response.getData()
    console.log("Spaces = " + inspect(data))
  })

  callback(null, responseWithContent("Booking meeting rooms is not yet support. Please try again tomorrow."))
};
