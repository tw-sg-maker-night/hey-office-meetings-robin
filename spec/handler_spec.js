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

  describe('validate meeting room', () => {

    it('should delegate for a valid meeting room', (done) => {
      var event = testEvent('BookMeetingRoom', 'DialogCodeHook', {}, {MeetingRoom: "Amoy"})
      handler.bookMeetingRoom(event, {
        succeed: function(response) {
          expect(response.dialogAction.type).toEqual('Delegate')
          expect(response.dialogAction.slots.MeetingRoom).toEqual('Amoy')
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
          expect(response.dialogAction.slots.MeetingRoom).toEqual(null)
          done();
        }
      })
    });

  });

  describe('validate start time', () => {

    it('should delegate for a valid start time', (done) => {
      var event = testEvent('BookMeetingRoom', 'DialogCodeHook', {}, {StartTime: "23:59"})
      handler.bookMeetingRoom(event, {
        succeed: function(response) {
          expect(response.dialogAction.type).toEqual('Delegate')
          expect(response.dialogAction.slots.StartTime).toEqual('23:59')
          done();
        }
      })
    })

    it('should elicit the date when the start time is in the past', (done) => {
      // Note: This test assumes start of day is invalid. (Will fail when run between 00:00 - 01:00)
      var event = testEvent('BookMeetingRoom', 'DialogCodeHook', {}, {StartTime: "00:00"})
      handler.bookMeetingRoom(event, {
        succeed: function(response) {
          expect(response.dialogAction.type).toEqual('ElicitSlot')
          expect(response.dialogAction.slotToElicit).toEqual('Date')
          expect(response.dialogAction.slots.StartTime).toEqual("00:00")
          expect(response.dialogAction.slots.Date).toEqual(null)
          done();
        }
      })
    })

  })

  describe('validate num people', () => {

    it('should delegate for a valid number of people', (done) => {
      var event = testEvent('BookMeetingRoom', 'DialogCodeHook', {}, {NumPeople: 4})
      handler.bookMeetingRoom(event, {
        succeed: function(response) {
          expect(response.dialogAction.type).toEqual('Delegate')
          expect(response.dialogAction.slots.NumPeople).toEqual(4)
          done();
        }
      })
    })

    it('should delegate for a invalid number of people', (done) => {
      var event = testEvent('BookMeetingRoom', 'DialogCodeHook', {}, {NumPeople: 500})
      handler.bookMeetingRoom(event, {
        succeed: function(response) {
          expect(response.dialogAction.type).toEqual('ElicitSlot')
          expect(response.dialogAction.slotToElicit).toEqual('NumPeople')
          expect(response.dialogAction.slots.NumPeople).toEqual(null)
          done();
        }
      })
    })

  })

  describe('validate date and start time', () => {

    // TODO: ...

  })

});
