const express = require('express');
const router = express.Router();
const { formatOwner, getUpdateString, get, create, put, deleteItem } = require('../utils');
const { validateId, createOwner, editOwner } = require('../validators');

router.get('/owners', async function(request, response, next) {
    const sql = `SELECT * FROM owners ORDER BY owner_id ASC`;
    await get(sql, null, formatOwner, response);
})

router.get('/owners/:id', validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `SELECT * FROM owners WHERE owner_id = $1`;
    await get(sql, [id], formatOwner, response);
});

router.delete('/owners/:id', validateId, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const sql = `DELETE FROM owners WHERE owner_id = $1 RETURNING *`;
    await deleteItem(sql, [id], response);
});

router.post('/owners/new', createOwner, async function(request, response, next) {
    const { ownerContact } = request.body
    const sql = `INSERT INTO owners (firstname, lastname, email, phone) VALUES ($1, $2, $3, $4) RETURNING *;`
    const sqlParams = [ownerContact.firstName, ownerContact.lastName, ownerContact.email, ownerContact.phone];
    await create(sql, sqlParams, formatOwner, response);
});

router.put('/owners/:id', editOwner, async function(request, response, next) {
    const id = parseInt(request.params.id)
    const { ownerContact } = request.body
    const updatedOwnerFields = getUpdateString({
        "email": ownerContact.email,
        "firstname": ownerContact.firstName,
        "lastname": ownerContact.lastName,
        "phone": ownerContact.phone
    });

    const sql = `UPDATE owners SET ${updatedOwnerFields} WHERE owner_id = $1 RETURNING *`;
    await put(sql, [id], formatOwner, response);
});

module.exports = router;