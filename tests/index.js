const utils = require('../src/server/utils');
const expect = require('chai').expect;;

describe('Utils', function() {
  it('should properly format date', function() {
    expect(utils.formatDate("2022-09-16 17:00:00+00")).to.equal('2022-09-16 17:00');
  });

  it('should create location object', function() {
    
    const locationTest = {
        location_id: 1,
        place: 'test place',
        city: 'test city',
        state: 'test state',
        seats: 1000
    }

    const locationTestOut = {
        "id": 1,
        "place": 'test place',
        "city": 'test city',
        "state": 'test state',
        "seats": 1000
    }
 
    expect(utils.formatLocation(locationTest)).to.deep.equal(locationTestOut);
  });

  it('should create owner object', function() {
    
    const ownerTest = {
        owner_id: 1,
        email: 'test@email.com',
        firstname: 'Adam',
        lastname: 'Bar',
        phone: "+1234567890"
    }

    const ownerTestOut = {
        "id": 1,
        "email": 'test@email.com',
        "firstName": 'Adam',
        "lastName": 'Bar',
        "phone": '+1234567890'
    }
 
    expect(utils.formatOwner(ownerTest)).to.deep.equal(ownerTestOut);
  });

  it('should create event object', function() {
    
    const eventTest = {
        id: 1,
        title: 'test event name',
        place: 'Madison Square Garden',
        city: 'New York City',
        state: 'NY',
        active: 'true',
        price: 123,
        startdate: '2022-09-16 17:00:00+00',
        enddate: '2022-09-16 19:00:00+00'
    }

    const eventTestOut = {
        "id": 1,
        "title": 'test event name',
        "venueName": 'Madison Square Garden, New York City, NY',
        "price": 123,
        "active": true,
        "eventDate": {
            "start": '2022-09-16 17:00',
            "end": '2022-09-16 19:00'
        }
    }
 
    expect(utils.formatEvent(eventTest)).to.deep.equal(eventTestOut);
  });

  it('should create entire event object', function() {
    
    const eventObj = {
        id: 1,
        title: 'test event name',
        place: 'Madison Square Garden',
        city: 'New York City',
        state: 'NY',
        price: 123,
        startdate: '2022-09-16 17:00:00+00',
        enddate: '2022-09-16 19:00:00+00',        
        active: 'true',
        location_id: 1,
        place: 'test place',
        city: 'test city',
        state: 'test state',
        seats: 1000,
        owner_id: 1,
        email: 'test@email.com',
        firstname: 'Adam',
        lastname: 'Bar',
        phone: "123-456-7890"
    }

    const eventTestOut = {
        "id": 1,
        "title": 'test event name',
        "venueName": 'test place, test city, test state',
        "price": 123,
        "eventDate": {
            "start": '2022-09-16 17:00',
            "end": '2022-09-16 19:00'
        },
        "active": true,
        "location": {
            "id": 1,
            "place": 'test place',
            "city": 'test city',
            "state": 'test state',
            "seats": 1000
        },
        "ownerContact": {
            "id": 1,
            "email": 'test@email.com',
            "firstName": 'Adam',
            "lastName": 'Bar',
            "phone": '123-456-7890'
        }
    }

    expect(utils.formatRes(eventObj)).to.deep.equal(eventTestOut);
  });
});
