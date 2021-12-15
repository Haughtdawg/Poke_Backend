const Pool = require("pg").Pool;
require("dotenv").config();

const devConfig = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: process.env.PORT,
    database: process.env.PG_DATABASE
})

const pool = new Pool(devConfig);

module.exports = pool;