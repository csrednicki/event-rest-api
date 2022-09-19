const Pool = require('pg').Pool
const pool = new Pool({
    user: 'ensonotest',
    host: 'db',
    database: 'ensonotest',
    password: 'ensonotest',
    port: 5432,
})

module.exports = {
    pool,
}