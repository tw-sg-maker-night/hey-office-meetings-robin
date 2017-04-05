const nock = require('nock')
const sinon = require('sinon')
const moment = require('moment')
const Robin = require('robin-js-sdk')
const RobinClient = require('../../lib/robin_client')

describe('RobinClient', () => {

  describe('findAvailableSpace', () => {

    var robinClient;
    var response;

    beforeEach(() => {
      var robinStub = {
        api: {
          freeBusy: {
            spaces: {
              get: function() {
                return new Promise((resolve, reject) => {
                  resolve({ getData: function() {
                    return response
                  }})
                })
              }
            }
          }
        }
      }
      robinClient = new RobinClient(robinStub)
    })

    it('should return space when one is available', (done) => {
      response = [{busy: [], space: {name: "Amoy"}}]
      var startDateTime = moment().hours(23).minutes(00)
      robinClient.findAvailableRoom(startDateTime).then(available => {
        expect(available.name).toEqual('Amoy')
        done()
      })
    })

    it('should return null when no space is available', (done) => {
      response = []
      var startDateTime = moment().hours(19).minutes(00)
      robinClient.findAvailableRoom(startDateTime).then(available => {
        expect(available).toEqual(null)
        done()
      })
    })

  })

})
