const express = require('express');
const router = express.Router();
const utils = require('../utils');
const db = require('../../pools');
const validators = require('../validators');

router.get('/search', validators.search, async function(request, response, next) {
    const query = request.query.q;
    const sql = `SELECT *
    FROM events, locations, owners
    WHERE
        events.location_id=locations.location_id
        AND events.owner_id=owners.owner_id
        AND (
            events.title ILIKE $1
            OR CAST(events.startdate AS TEXT) ILIKE $1
            OR CAST(events.enddate AS TEXT) ILIKE $1
            OR locations.place ILIKE $1
            OR locations.city ILIKE $1
            OR locations.state ILIKE $1
            OR owners.firstname ILIKE $1
            OR owners.lastname ILIKE $1
            OR owners.email ILIKE $1
            OR owners.phone ILIKE $1
        )
    ORDER BY startdate DESC`;
    
    await utils.get(sql, [`%${query}%`], utils.formatEventBasic.bind(utils), response);
});

module.exports = router;