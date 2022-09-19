# Event REST API

This API is a typical CRUD for mass events like concerts and other performances. With its help you can create, read, edit, delete and search for events. The API also offers the possibility to create contacts for the people responsible for the event. There are also endpoints with which you can manage the locations of events.

In the assignment I received, I decided to change the structure slightly, to expand it. I divided the data into three tables in the database. For events, locations and contacts to owners. I did this because without this, the data could be repeated, which I did not want.  In addition, this allows one contact or location to be assigned to multiple events. This also allows locations and contacts to be modified without having to modify the event itself. I have added fields for title, price, activity status, start and end times. In the location object, I added the number of seats the hall can hold. The venueName field is calculated from the location object. I created also additional CRUD type endpoints for editing locations and owner contacts. Below is the full object of the event.

```
{
    id: 2,
    title: "Bullet Train to Paducah",
    venueName: "Microsoft Theatre, Los Angeles, CA",
    price: 65,
    active: true,
    eventDate: {
        start: "2022-09-20 18:00",
        end: "2022-09-20 20:00"
    },
    location: {
        id: 2,
        place: "Microsoft Theatre",
        city: "Los Angeles",
        state: "CA",
        seats: 4000
    },
    ownerContact: {
        id: 2,
        email: "alan.dual@gmail.com",
        firstName: "Alan",
        lastName: "Dual",
        phone: "222333444"
    }
}
```
Below is the full list of available endpoints

## Available endpoints
### Events
```
GET /events
GET /event/:id
DELETE /events/:id
POST /events/new
PUT /events/:id
```
### Search
```
GET /search?q=:query
```

### Locations
```
GET /locations
GET /locations/:id
DELETE /locations/:id
POST /locations/new
PUT /locations/:id
```
### Owners contacts
```
GET /owners
GET /owners/:id
DELETE /owners/:id
POST /owners/new
PUT /owners/:id
```

## How to access API
This REST API is listening on port ```3600``` on machine which is running docker-compose.

## Docker
The project is based on an environment using docker-based containerisation and docker-compose. To start the project, issue the command: ```docker-compose up -d```

## Database

The project uses a PostgreSQL database in the latest available version. The database is initialised with the first start of the docker-compose stack. The database initialisation files are located in ```db/initdb.sql```. During initialisation, basic tables and test data are created.

## Node

The project uses NodeJS in the latest available version. In the project, I use the nodemon tool to monitor the status of the application. This tool automatically reloads the project when a change is detected or when it encounters a problem.

## Unit tests

I created unit tests for the utilities the project uses. The tests are based on mocha and chai tools. To run the tests, issue the command in the project main directory: ```npm run test```. For the docker stack run command ```docker exec -it event-rest-api_web_1 npm run test```

## Validation and sanitization

I used the [express-validator](https://express-validator.github.io/docs/) in the project. It offers a range of tools for validating and sanitizing data. 
All endpoints have sanitisation and input validation enabled. All text fields are escaped and truncated from excessive spaces. Fields are also set to length limits that match the field length limits in the database. All data validators are in the file [src/server/validators.js](/src/server/validators.js)

# Software used in development

- pgAdmin 4
- Postman
- Visual Studio Code
- Linux ubuntu
- Docker

# Testing endpoints
I was testing endpoints in Postman. For this occasion I created collection of queries. You can import this collection for easier testing. Collection was exported in version 2.1. You can find this file ```postman_collection.json``` in the main folder.

## Event endpoint

### Get all events
This method is used to list all existing and active events. Active events are ones with active field set to true.
```
GET /events

RESPONSE 200 OK
[
    {
        "id": 2,
        "title": "Bullet Train to Paducah",
        "venueName": "Microsoft Theatre, Los Angeles, CA",
        "eventDate": {
            "start": "2022-09-20 18:00",
            "end": "2022-09-20 20:00"
        }
    },
    {
        "id": 3,
        "title": "Bullet Train to Paducah - Special event",
        "venueName": "New name for big hall, Chicago, IL",
        "eventDate": {
            "start": "2022-09-22 18:00",
            "end": "2022-09-22 20:00"
        }
    },
    ...
]    

```

### Get specified event
This method is used to get single event using specified id regardless if is active or not.
```
GET /event/:id

GET /event/1

RESPONSE 200 OK
[
    {
        "id": 1,
        "title": "Some super cool movie",
        "venueName": "Microsoft Theatre, Los Angeles, CA",
        "price": 123.22,
        "active": false,
        "eventDate": {
            "start": "2022-07-16 20:00",
            "end": "2022-09-16 22:00"
        },
        "location": {
            "id": 2,
            "place": "Microsoft Theatre",
            "city": "Los Angeles",
            "state": "CA",
            "seats": 4000
        },
        "ownerContact": {
            "id": 1,
            "email": "differentemail@gmail.com",
            "firstName": "John",
            "lastName": "Doe",
            "phone": "2223334440"
        }
    }
]

```

### Create new event with new location and new owner
This method is used to schedule new event including new location and new owner

```
POST /events/new
{
    "title": "Some new special event",
    "price": 100,
    "eventDate": {
        "start": "2022-09-19 20:00",
        "end": "2022-09-19 22:00"
    },
    "location": {
        "place": "Really big hall",
        "city": "Chicago",
        "state": "IL",
        "seats": 5000
    },
    "ownerContact": {
        "email": "john.doe@gmail.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "2223334440"
    }
}

RESPONSE: 201 Created
{
    "status": 201,
    "message": "OK",
    "data": {
        "id": 193,
        "title": "Some new special event",
        "venueName": "Really big hall, Chicago, IL",
        "price": 100,
        "active": true,
        "eventDate": {
            "start": "2022-09-19 20:00",
            "end": "2022-09-19 22:00"
        },
        "location": {
            "id": 217,
            "place": "Really big hall",
            "city": "Chicago",
            "state": "IL",
            "seats": 5000
        },
        "ownerContact": {
            "id": 170,
            "email": "johndoe@gmail.com",
            "firstName": "John",
            "lastName": "Doe",
            "phone": "2223334440"
        }
    }
}
```

### Create event for existing location and existing owner
This is same method as used to schedule new event but we can pass existing id, for only location or ownerContact or both. 

Example below creates new event with new location and new contact owner.
```
POST /events/new
{
    "title": "Some new special event",
    "price": 100,
    "eventDate": {
        "start": "2022-09-19 20:00",
        "end": "2022-09-19 22:00"
    },
    "location": {
        "id": 2
    },
    "ownerContact": {
        "id": 1
    }
}

RESPONSE: 201 Created
{
    "status": 201,
    "message": "OK",
    "data": {
        "id": 194,
        "title": "Some new special event",
        "venueName": "Really big hall, Chicago, IL",
        "price": 100,
        "active": true,
        "eventDate": {
            "start": "2022-09-19 20:00",
            "end": "2022-09-19 22:00"
        },
        "location": {
            "id": 218,
            "place": "Really big hall",
            "city": "Chicago",
            "state": "IL",
            "seats": 5000
        },
        "ownerContact": {
            "id": 1,
            "email": "test@email.com",
            "firstName": "Adam",
            "lastName": "Bar",
            "phone": "1234567890"
        }
    }
}
```

### Edit event
Example below shows how to edit existing event. Changes will be made to all three tables events, location, owners.
```
PUT /events/1
{
    "title": "Some new special event",
    "price": 123.22,
    "active": false,
    "eventDate": {
        "start": "2022-07-18 20:00",
        "end": "2022-09-18 22:00"
    },
    "location": {
        "place": "New name for big hall",
        "city": "Chicago",
        "state": "IL",
        "seats": 5000        
    },
    "ownerContact": {
        "email": "different.email@gmail.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "2223334440"        
    }
}

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK",
    "data": {
        "id": 1,
        "title": "Some new special event",
        "venueName": "New name for big hall, Chicago, IL",
        "price": 123.22,
        "active": false,
        "eventDate": {
            "start": "2022-07-18 20:00",
            "end": "2022-09-18 22:00"
        },
        "location": {
            "id": 1,
            "place": "New name for big hall",
            "city": "Chicago",
            "state": "IL",
            "seats": 5000
        },
        "ownerContact": {
            "id": 1,
            "email": "differentemail@gmail.com",
            "firstName": "John",
            "lastName": "Doe",
            "phone": "2223334440"
        }
    }
}
```

### Edit event for only some fields
Using same endpoint we can pass only some fields that we want to change. For example editing only event title
```
PUT /events/1
{
    "title": "Some super cool movie"
}

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK",
    "data": {
        "id": 1,
        "title": "Some super cool movie",
        "venueName": "New name for big hall, Chicago, IL",
        "price": 123.22,
        "active": true,
        "eventDate": {
            "start": "2022-07-18 20:00",
            "end": "2022-09-18 22:00"
        },
        "location": {
            "id": 1,
            "place": "New name for big hall",
            "city": "Chicago",
            "state": "IL",
            "seats": 5000
        },
        "ownerContact": {
            "id": 1,
            "email": "differentemail@gmail.com",
            "firstName": "John",
            "lastName": "Doe",
            "phone": "2223334440"
        }
    }
}
```

### Change location of the event
Change location of the event to some other already existing location in db
```
PUT /events/1
{
    "location": {
        "id": 2
    }
}

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK",
    "data": {
        "id": 1,
        "title": "Some super cool movie",
        "venueName": "Microsoft Theatre, Los Angeles, CA",
        "price": 123.22,
        "active": true,
        "eventDate": {
            "start": "2022-07-18 20:00",
            "end": "2022-09-18 22:00"
        },
        "location": {
            "id": 2,
            "place": "Microsoft Theatre",
            "city": "Los Angeles",
            "state": "CA",
            "seats": 4000
        },
        "ownerContact": {
            "id": 1,
            "email": "differentemail@gmail.com",
            "firstName": "John",
            "lastName": "Doe",
            "phone": "2223334440"
        }
    }
}
```

### Disabling event
We can also disable entire event
```
PUT /events/12
{
    "active": false
}

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK",
    "data": {
        "id": 1,
        "title": "Some super cool movie",
        "venueName": "Microsoft Theatre, Los Angeles, CA",
        "price": 123.22,
        "active": false,
        "eventDate": {
            "start": "2022-07-18 20:00",
            "end": "2022-09-18 22:00"
        },
        "location": {
            "id": 2,
            "place": "Microsoft Theatre",
            "city": "Los Angeles",
            "state": "CA",
            "seats": 4000
        },
        "ownerContact": {
            "id": 1,
            "email": "differentemail@gmail.com",
            "firstName": "John",
            "lastName": "Doe",
            "phone": "2223334440"
        }
    }
}
```

### Delete specified event
```
DELETE /events/:id

DELETE /events/3

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK"
}
```


## Search endpoint

Searchable fields:
- event title, start date, end date
- location place, city and state (venueName)
- owner contact firstname, lastname, email, phone number
The search is also done on elements with the "active" flag set to "false".

```
GET /search?q=microsoft

RESPONSE 200 OK
[
    {
        "id": 2,
        "title": "Bullet Train to Paducah",
        "venueName": "Microsoft Theatre, Los Angeles, CA",
        "eventDate": {
            "start": "2022-09-20 18:00",
            "end": "2022-09-20 20:00"
        }
    },
    {
        "id": 5,
        "title": "QWerty",
        "venueName": "Microsoft Theatre, Los Angeles, CA",
        "eventDate": {
            "start": "2022-09-18 20:00",
            "end": "2022-09-18 22:00"
        }
    }
]
```

## Location endpoint

### Get all locations
```
GET /locations/

RESPONSE 200 OK
[
    {
        "id": 1,
        "place": "New name for big hall",
        "city": "Chicago",
        "state": "IL",
        "seats": 5000
    },
    {
        "id": 2,
        "place": "Microsoft Theatre",
        "city": "Los Angeles",
        "state": "CA",
        "seats": 4000
    },
    ...
]
```

### Get single location

```
GET /locations/1

RESPONSE 200 OK
[
    {
        "id": 1,
        "place": "New name for big hall",
        "city": "Chicago",
        "state": "IL",
        "seats": 5000
    }
]
```

### Create new location
```
POST /locations/new
{
    "location": {
        "place": "New super hall",
        "city": "New York",
        "state": " NY",
        "seats": 8000
    }
}

RESPONSE 201 Created
{
    "status": 201,
    "message": "OK",
    "data": {
        "id": 220,
        "place": "New super hall",
        "city": "New York",
        "state": "NY",
        "seats": 8000
    }
}
```

### Edit location
```
PUT /locations/220
{
    "location": {
        "place": "Edited name big hall",
        "city": "Chicago",
        "state": "IL",
        "seats": 600
    }
}

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK",
    "data": {
        "id": 220,
        "place": "Edited name big hall",
        "city": "Chicago",
        "state": "IL",
        "seats": 600
    }
}
```
As previously been said, we can edit all properties or only some of them. 
```
PUT /locations/220
{
    "location": {
        "place": "Edited new name big hall",
        "seats": 800
    }
}

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK",
    "data": {
        "id": 220,
        "place": "Edited new name big hall",
        "city": "Chicago",
        "state": "IL",
        "seats": 800
    }
}
```

### Delete location
```
DELETE /locations/221

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK"
}
```
In case if selected location is used by event API will not let to delete this location
```
DELETE /locations/50

RESPONSE 
{
    "name": "Error",
    "status": 422,
    "message": "Cannot delete this entity because it is linked to others"
}
```

## Owner endpoint

### Get all owners
```
GET /owners/

RESPONSE 200 OK
[
  {
        "id": 4,
        "email": "test@email123a.ca",
        "firstName": "Adam",
        "lastName": "aaaaa",
        "phone": "1234567890"
    },
    {
        "id": 6,
        "email": "test@email.com",
        "firstName": "Adam",
        "lastName": "Bar",
        "phone": "1234567890"
    },
    ...
]
```

### Get single owner
```
GET /owners/1

RESPONSE 200 OK
[
    {
        "id": 1,
        "email": "differentemail@gmail.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "2223334440"
    }
]
```

### Create new contact owner
```
POST /owners/new
{
    "ownerContact": {
        "email": "some.new.contact@email.com",
        "firstName": "Marian",
        "lastName": "Blacy",
        "phone": "3330321002"
    }
}

RESPONSE 201 Created
{
    "status": 201,
    "message": "OK",
    "data": {
        "id": 172,
        "email": "some.new.contact@email.com",
        "firstName": "Marian",
        "lastName": "Blacy",
        "phone": "3330321002"
    }
}
```

### Edit contact owner
```
PUT /owners/6
{
    "ownerContact": {
        "email": "testss@mail.com",
        "firstName": "Adams",
        "lastName": "Bars",
        "phone": "2234567890"
    }
}

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK",
    "data": {
        "id": 6,
        "email": "testss@mail.com",
        "firstName": "Adams",
        "lastName": "Bars",
        "phone": "2234567890"
    }
}
```

### Delete contact owner
```
DELETE /owners/172

RESPONSE 200 OK
{
    "status": 200,
    "message": "OK"
}

```
If there is no owner with that id we will get error
```
DELETE /owners/172

RESPONSE 404 Not found
{
    "name": "Error",
    "status": 404,
    "message": "Not found"
}
```
