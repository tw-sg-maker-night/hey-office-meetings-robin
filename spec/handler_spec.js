const nock = require('nock');
const handler = require('../handler');

function testEvent(intentName = 'TestIntent', invocationSource = 'FulfillmentCodeHook', sessionAttributes = {}, slots = {}) {
    return {
      sessionAttributes: sessionAttributes,
      invocationSource: invocationSource,
      currentIntent: {
        name: intentName,
        slots: slots
      }
    }
}

describe('BookMeetingRoom Handler', () => {

  describe('Setting meeting room', () => {

    it('should Delegate', (done) => {
      var event = testEvent('BookMeetingRoom', 'DialogCodeHook', {}, {MeetingRoom: "Amoy"})
      handler.bookMeetingRoom(event, {
        succeed: function(response) {
          console.log('Response = ', response)
          expect(response.dialogAction.type).toBe('Delegate')
          done();
        }
      })
    });

  });

});
