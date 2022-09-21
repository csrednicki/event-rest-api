const express = require('express');
const router = express.Router();
const utils = require('../utils');
const validators = require('../validators');

router.get('/locations', async function(request, response, next) {
    const sql = `SELECT * FROM locations ORDER BY location_id ASC`;
    await utils.get(sql, null, utils.formatLocation.bind(utils), response);
});

router.get('/locations/:id', validators.validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `SELECT * FROM locations WHERE location_id = $1 ORDER BY location_id ASC`;
    await utils.get(sql, [id], utils.formatLocation.bind(utils), response);
});

router.delete('/locations/:id', validators.validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `DELETE FROM locations WHERE locations.location_id = $1 RETURNING *`;
    await utils.delete(sql, [id], response);
});

router.post('/locations/new', validators.createLocation, async function(request, response, next) {
    const { location } = request.body
    const sqlParams = [location.place, location.city, location.state, location.seats];
    const sql = `INSERT INTO locations (place, city, state, seats) VALUES ($1, $2, $3, $4) RETURNING *;`
    await utils.create(sql, sqlParams, utils.formatLocation.bind(utils), response);
});

router.put('/locations/:id', validators.editLocation, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const { location } = request.body
    const updatedLocationFields = utils.getUpdateString({
        "place": location.place,
        "city": location.city,
        "state": location.state,
        "seats": location.seats
    });

    const sql = `UPDATE locations SET ${updatedLocationFields} WHERE location_id = $1 RETURNING *`;
    await utils.put(sql, [id], utils.formatLocation.bind(utils), response);
});

module.exports = router;