const nock = require('nock')
const moment = require('moment')
const RobinClient = require('../../lib/robin_client')

describe('RobinClient', () => {

  describe('findAvailableSpace', () => {

    it('should return space when one is available', (done) => {
      var startDateTime = moment().hours(23).minutes(00)
      RobinClient.findAvailableRoom(startDateTime).then(available => {
        expect(available.name).toEqual('Amoy')
        done()
      })
    })

    it('should return null when no space is available', (done) => {
      var startDateTime = moment().hours(19).minutes(00)
      RobinClient.findAvailableRoom(startDateTime).then(available => {
        expect(available).toEqual(null)
        done()
      })
    })

  })

})
