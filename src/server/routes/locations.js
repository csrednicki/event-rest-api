const express = require('express');
const router = express.Router();
const utils = require('../utils');
const db = require('../../pools');
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

    let locationUpdate = [];
    if(location.place) locationUpdate.push(`place='${location.place}'`);
    if(location.city) locationUpdate.push(`city='${location.city}'`);
    if(location.state) locationUpdate.push(`state='${location.state}'`);
    if(location.seats) locationUpdate.push(`seats='${location.seats}'`);            
    const updatedLocationFields = locationUpdate.join(',');

    const sql = `UPDATE locations SET ${updatedLocationFields} WHERE location_id = $1 RETURNING *`;
    await utils.put(sql, [id], utils.formatLocation.bind(utils), response);
});

module.exports = router;