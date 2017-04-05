"use strict";

var Utils = require('./utils')
var moment = require('moment')
var Promise = require('bluebird')

var organizationId = process.env.ROBIN_ORGANIZATION_ID
var locationId = process.env.ROBIN_LOCATION_ID

const MAX_PEOPLE = 20

function RobinClient(robin) {
    var robin = robin

    this.findAvailableRoom = function(startDateTime, minPeople, duration, spaceId) {
        minPeople = minPeople ? minPeople : 0
        duration = duration ? duration : 60
        spaceId = spaceId ? spaceId : null

        return new Promise((resolve, reject) => {
          var endDateTime = moment(startDateTime).add(duration, 'minute')
          robin.api.freeBusy.spaces.get({
            location_ids: locationId,
            after: startDateTime.format(),
            before: endDateTime.format(),
            duration: duration,
            min_capacity: minPeople,
            max_capacity: MAX_PEOPLE,
            page: 1,
            per_page: 10
          }).then((response) => {
            var spaces = response.getData()
            var available = spaces.filter(free_busy => {
              return free_busy.busy.length == 0
            })
            resolve(available[0] ? available[0].space : null)
          }).catch((error) => {
            console.log("Error occurred", Utils.inspect(error))
            reject(error)
          })
        })
      }

      this.createEvent = function(room, startDate, endDate) {
          return new Promise((resolve, reject) => {
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
              console.log("Event Created:", Utils.inspect(event))
              resolve(event)
            }).catch((error) => {
              console.log("Error occurred", Utils.inspect(error))
              reject(error)
            })
          })
      }
}

module.exports = RobinClient
