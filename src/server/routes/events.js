const express = require('express');
const router = express.Router();
const utils = require('../utils');
const db = require('../../pools');
const validators = require('../validators');

router.get('/events', async function(request, response, next) {
    const sql = `SELECT *
        FROM events, locations, owners
        WHERE events.location_id=locations.location_id AND events.owner_id=owners.owner_id AND events.active='t'
        ORDER BY id ASC`;

    await utils.get(sql, null, utils.formatEventBasic.bind(utils), response);
});

router.get('/events/:id', validators.validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `SELECT * 
        FROM events, locations, owners 
        WHERE events.location_id=locations.location_id AND events.owner_id=owners.owner_id AND events.id = $1
        ORDER BY startdate DESC`;
    await utils.get(sql, [id], utils.formatRes.bind(utils), response);
});

router.delete('/events/:id', validators.validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `DELETE FROM events WHERE events.id = $1 RETURNING *`;
    await utils.delete(sql, [id], response);
});

// this endpoint is more complicated than usually because it changes 3 different tables
router.post('/events/new', validators.createEvent, async function(request, response, next) {
    const { title, price, eventDate, location, ownerContact } = request.body
    
    // if this optional parameter "active" was passed as false it shoud stay that way
    // otherwise should be set to true
    let active = request.body.active === false ? false : true;
    let location_id = false,
        owner_id = false,
        event_id = false;

    try {
        await db.pool.query('BEGIN')

        if(location) {
            let locationSql, locationValues;
            
            if(location.id) {
                locationSql = `SELECT * FROM locations WHERE location_id = $1`;
                locationValues = [location.id]
            } else if(location.place && location.city && location.state && location.seats) {
                locationSql = `INSERT INTO locations (place, city, state, seats) VALUES ($1, $2, $3, $4) RETURNING *;`
                locationValues = [location.place, location.city, location.state, location.seats];
            }
   
            location_id = utils.getVal(await db.pool.query(locationSql, locationValues)).location_id;
        } else {
            throw { name: 'Error', status: 422, message: 'Location: missing fields' };
        }

        if(ownerContact) {
            let ownerSql, ownerValues;
            if(ownerContact.id) {
                ownerSql = `SELECT * FROM owners WHERE owner_id = $1`;
                ownerValues = [ownerContact.id]
            } else if(ownerContact.email && ownerContact.firstName && ownerContact.lastName && ownerContact.phone) {
                ownerSql = `INSERT INTO owners (email, firstName, lastName, phone) VALUES ($1, $2, $3, $4) RETURNING *;`
                ownerValues = [ownerContact.email, ownerContact.firstName, ownerContact.lastName, ownerContact.phone];
            }

            owner_id = utils.getVal(await db.pool.query(ownerSql, ownerValues)).owner_id;
        } else {
            throw { name: 'Error', status: 422, message: 'ownerContact: missing fields' };
        }

        if(location_id && owner_id) {
            const eventSql = `INSERT INTO events(title, price, startdate, enddate, active, location_id, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`
            const eventValues = [title, price, eventDate.start, eventDate.end, active, location_id, owner_id];
            event_id = utils.getVal(await db.pool.query(eventSql, eventValues)).id;

            if(event_id) {
                const sql = `SELECT * 
                FROM events, locations, owners 
                WHERE events.location_id=locations.location_id AND events.owner_id=owners.owner_id AND events.id = $1
                ORDER BY startdate DESC`;

                await utils.create(sql, [event_id], utils.formatRes.bind(utils), response);
            } else {
                throw { name: 'Error', status: 500, message: 'Event: error adding new event' };
            }
        } else {
            throw { name: 'Error', status: 422, message: 'Missing location id or ownerContact id' };
        }

        await db.pool.query('COMMIT')
    } catch (e) {
        await db.pool.query('ROLLBACK')
        utils.errorHandler(e, response);
    }  
});

// this endpoint is more complicated than usually because it changes 3 different tables
router.put('/events/:id', validators.editEvent, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const { title, price, eventDate, location, ownerContact } = request.body
    let active = request.body.active === false ? "false" : "true";
    let location_id, owner_id, event_id = id;

    try {
        await db.pool.query('BEGIN')

        const sqlConstraintsID = `SELECT events.id, locations.location_id, owners.owner_id
            FROM events, locations, owners 
            WHERE events.location_id=locations.location_id AND events.owner_id=owners.owner_id AND events.id = $1`;
        const constraintsRes = await db.pool.query(sqlConstraintsID, [event_id])

        // if there is one, pass it on
        if(constraintsRes.rows.length > 0) {
            const constraints = constraintsRes.rows[0];
            location_id = (location && location.id) ? location.id : constraints.location_id;
            owner_id = (ownerContact && ownerContact.id) ? ownerContact.id : constraints.owner_id;
        } else {
            // or raise an error
            throw { name: 'Error', status: 400, message: 'Event id not found' };            
        }

        if(location && (location.place || location.city || location.state || location.seats)) {
            const updatedLocationFields = utils.getUpdateString({
                "place": location.place,
                "city": location.city,
                "state": location.state,
                "seats": location.seats
            });
            const locationSql = `UPDATE locations SET ${updatedLocationFields} WHERE location_id = $1 RETURNING *`;
            const locationRes = await db.pool.query(locationSql, [location_id]).catch(e => {
                throw { name: 'Error', status: 400, message: e.detail };
            });

            if(locationRes.rows.length <= 0) {
                throw { name: 'Error', status: 400, message: 'Location id not found' };
            }
        }

        if(ownerContact && (ownerContact.email || ownerContact.firstName || ownerContact.lastName || ownerContact.phone)) {
            const updatedOwnerFields = utils.getUpdateString({
                "email": ownerContact.email,
                "firstname": ownerContact.firstName,
                "lastname": ownerContact.lastName,
                "phone": ownerContact.phone
            });
            const ownerSql = `UPDATE owners SET ${updatedOwnerFields} WHERE owner_id = $1 RETURNING *`;
            const ownerRes = await db.pool.query(ownerSql, [owner_id]).catch(e => {
                throw { name: 'Error', status: 400, message: e.detail };
            });

            if(ownerRes.rows.length <= 0) {
                throw { name: 'Error', status: 400, message: 'Owner id not found' };
            }
        }
        if(event_id) {
            const updatedFields = utils.getUpdateString({
                "title": title,
                "price": price,
                "startdate": (eventDate && eventDate.start) ? utils.formatDate(eventDate.start) : false,
                "enddate": (eventDate && eventDate.end) ? utils.formatDate(eventDate.end) : false,
                "active": active,
                "location_id": location_id,
                "owner_id": owner_id
            });
            const sql = `UPDATE events SET ${updatedFields} WHERE id = $1 RETURNING *`;
            const results = await db.pool.query(sql, [event_id]).catch(e => {
                throw { name: 'Error', status: 400, message: e.detail };
            });

            if(results.rows.length > 0) {
                const eventGetAll = `SELECT * 
                FROM events, locations, owners 
                WHERE events.location_id=locations.location_id AND events.owner_id=owners.owner_id AND events.id = $1
                ORDER BY startdate DESC`;

                await utils.put(eventGetAll, [event_id], utils.formatRes.bind(utils), response);
            } else {
               throw { name: 'Error', status: 400, message: results };
            }
        }

        await db.pool.query('COMMIT')
    } catch (e) {
        await db.pool.query('ROLLBACK')
        utils.errorHandler(e, response);
    }  
});

module.exports = router;