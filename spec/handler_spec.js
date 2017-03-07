const nock = require('nock');
const handler = require('../handler');

function testEvent(intentName, invocationSource, sessionAttributes, slots) {
  intentName = intentName || 'TestIntent'
  invocationSource = invocationSource || 'FulfillmentCodeHook'
  sessionAttributes = sessionAttributes || {}
  slots = slots || {}
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

    it('should delegate for a valid meeting room', (done) => {
      var event = testEvent('BookMeetingRoom', 'DialogCodeHook', {}, {MeetingRoom: "Amoy"})
      handler.bookMeetingRoom(event, {
        succeed: function(response) {
          expect(response.dialogAction.type).toEqual('Delegate')
          expect(response.dialogAction.slots.MeetingRoom).toEqual('Amoy')
          expect(response.sessionAttributes.room).toEqual('Amoy')
          done();
        }
      })
    });

    it('should elicit for a invalid meeting room', (done) => {
      var event = testEvent('BookMeetingRoom', 'DialogCodeHook', {}, {MeetingRoom: "Invalid"})
      handler.bookMeetingRoom(event, {
        succeed: function(response) {
          expect(response.dialogAction.type).toEqual('ElicitSlot')
          expect(response.dialogAction.slotToElicit).toEqual('MeetingRoom')
          expect(response.dialogAction.slots).toEqual({
            MeetingRoom: null
          })
          done();
        }
      })
    });

  });

});
