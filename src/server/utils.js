const moment = require('moment');
const db = require('../pools');

// exported function expresssion
exports.formatDate = (date) => {
    return moment(date).format('YYYY-MM-DD HH:mm');
}

exports.formatLocation = (res) => {
    if (res.location_id) {
        return {
            "id": res.location_id,
            "place": `${res.place}`,
            "city": `${res.city}`,
            "state": `${res.state}`,
            "seats": parseInt(res.seats)
        };
    }
}

exports.formatOwner = (res) => {
    if(res.owner_id) {
        return {
            "id": res.owner_id,
            "email": `${ res.email ? res.email : "" }`,
            "firstName": `${ res.firstname }`,
            "lastName": `${ res.lastname }`,
            "phone": `${ res.phone }`,
        }
    }
}

exports.formatEvent = (res) => {
    return {
        "id": res.id,
        "title": `${res.title}`,
        "venueName": `${res.place}, ${res.city}, ${res.state}`,
        "price": parseFloat(res.price),
        "active": JSON.parse(res.active),
        "eventDate": {
            "start": `${ this.formatDate(res.startdate) }`,
            "end": `${ this.formatDate(res.enddate) }`,
        }
    };
}

exports.formatRes = (res) => {
    const event = this.formatEvent(res);
    const location = this.formatLocation(res);
    const owner = this.formatOwner(res);

    return {
        ...event,
        "location": {
            ...location
        },
        "ownerContact": {
            ...owner
        }
    };
}

exports.formatEventBasic = (res) => {
    return {
        "id": res.id,
        "title": `${res.title}`,
        "venueName": `${res.place}, ${res.city}, ${res.state}`,
        "eventDate": {
            "start": `${ this.formatDate(res.startdate) }`,
            "end": `${ this.formatDate(res.enddate) }`,
        }
    };
}    

exports.errorHandler = (error, response) => {
    if(error.code === '23503') {
        // postgres error
        error = {
            name: `Error`,
            status: 422,
            message: `Cannot delete this entity because it is linked to others`,
        }
    }

    response.status(error.status || 500).json(error);
}

exports.get = async (sql, sqlParams, cb, response) => {
    try {
        const results = sqlParams ? 
            await db.pool.query(sql, sqlParams) : await db.pool.query(sql);

        if(results.rows.length > 0) {
            const data = results.rows.map(element => cb(element))
            response.status(200).json(data);
        } else {
            response.status(404).json({
                status: 404,
                message: `Not found`
            });
        }
    } catch(e) {
        this.errorHandler(e, response)
    }
}

exports.deleteItem = async (sql, sqlParams, response) => {
    try {
        const results = await db.pool.query(sql, sqlParams);
        if(results.rows.length > 0) {
            response.status(200).json({
                status: 200,
                message: 'OK'
            });
        } else {
            throw { name: 'Error', status: 404, message: 'Not found' };
        }
    } catch(e) {
        this.errorHandler(e, response)
    }
}

exports.create = async (sql, sqlParams, cb, response) => {
    try {
        const results = await db.pool.query(sql, sqlParams);
        if(results.rows.length > 0) {
            const row = results.rows[0];
            response.status(201).json({
                status: 201,
                message: `OK`,
                data: cb(row)
            });
        } else {
            throw { name: 'Error', status: 500, message: 'Error creating new item' };
        }
    } catch (e) {
        this.errorHandler(e, response)
    }  
}

exports.put = async (sql, sqlParams, cb, response) => {
    try {
        const results = await db.pool.query(sql, sqlParams).catch(e => {
            throw { name: 'Error', status: 400, message: e.detail };
        });

        if(results.rows.length > 0) {
            const row = results.rows[0];
            response.status(200).json({
                status: 200,
                message: `OK`,
                data: cb(row)
            });
        } else {
            throw { name: 'Error', status: 400, message: 'Not updated' };
        }
    } catch (e) {
        this.errorHandler(e, response)
    }  
}

exports.query = async (sql, sqlParams) => {
    const result = await db.pool.query(sql, sqlParams)
    if(result.rows.length > 0) {
        return result.rows[0];
    } else {
        return false;
    }
}

exports.getUpdateString = (obj) => {
    let str = [];
    Object.entries(obj).map(([k,v]) => {
        if(v) {
            str.push(`${k}='${v}'`);
        }
    });
    return str.join(',');
}

exports.getVal = (res) => {
    if(res.rows.length > 0) {
        return res.rows[0];
    } else {
        throw { name: 'Error', status: 400, message: 'Id not found' };
    }
}
