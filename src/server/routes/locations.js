const express = require('express');
const router = express.Router();
const { formatLocation, getUpdateString, get, create, put, deleteItem } = require('../utils');
const { validateId, createLocation, editLocation } = require('../validators');

router.get('/locations', async function(request, response, next) {
    const sql = `SELECT * FROM locations ORDER BY location_id ASC`;
    await get(sql, null, formatLocation, response);
});

router.get('/locations/:id', validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `SELECT * FROM locations WHERE location_id = $1 ORDER BY location_id ASC`;
    await get(sql, [id], formatLocation, response);
});

router.delete('/locations/:id', validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `DELETE FROM locations WHERE location_id = $1 RETURNING *`;
    await deleteItem(sql, [id], response);
});

router.post('/locations/new', createLocation, async function(request, response, next) {
    const { location } = request.body
    const sqlParams = [location.place, location.city, location.state, location.seats];
    const sql = `INSERT INTO locations (place, city, state, seats) VALUES ($1, $2, $3, $4) RETURNING *;`
    await create(sql, sqlParams, formatLocation, response);
});

router.put('/locations/:id', editLocation, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const { location } = request.body
    const updatedLocationFields = getUpdateString({
        "place": location.place,
        "city": location.city,
        "state": location.state,
        "seats": location.seats
    });

    const sql = `UPDATE locations SET ${updatedLocationFields} WHERE location_id = $1 RETURNING *`;
    await put(sql, [id], formatLocation, response);
});

module.exports = router;