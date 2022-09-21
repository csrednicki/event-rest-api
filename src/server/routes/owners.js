const express = require('express');
const router = express.Router();
const utils = require('../utils');
const validators = require('../validators');

router.get('/owners', async function(request, response, next) {
    const sql = `SELECT * FROM owners ORDER BY owner_id ASC`;
    await utils.get(sql, null, utils.formatOwner.bind(utils), response);
})

router.get('/owners/:id', validators.validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `SELECT * FROM owners WHERE owner_id = $1`;
    await utils.get(sql, [id], utils.formatOwner.bind(utils), response);
});

router.delete('/owners/:id', validators.validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `DELETE FROM owners WHERE owner_id = $1 RETURNING *`;
    await utils.delete(sql, [id], response);
});

router.post('/owners/new', validators.createOwner, async function(request, response, next) {
    const { ownerContact } = request.body
    const sql = `INSERT INTO owners (firstname, lastname, email, phone) VALUES ($1, $2, $3, $4) RETURNING *;`
    const sqlParams = [ownerContact.firstName, ownerContact.lastName, ownerContact.email, ownerContact.phone];
    await utils.create(sql, sqlParams, utils.formatOwner.bind(utils), response);
});

router.put('/owners/:id', validators.editOwner, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const { ownerContact } = request.body
    const updatedOwnerFields = utils.getUpdateString({
        "email": ownerContact.email,
        "firstname": ownerContact.firstName,
        "lastname": ownerContact.lastName,
        "phone": ownerContact.phone
    });

    const sql = `UPDATE owners SET ${updatedOwnerFields} WHERE owner_id = $1 RETURNING *`;
    await utils.put(sql, [id], utils.formatOwner.bind(utils), response);
});

module.exports = router;