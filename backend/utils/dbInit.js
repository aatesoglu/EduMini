const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const createDB = async () => {
    const { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env;

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST || 'localhost',
            port: DB_PORT || 3306,
            user: DB_USER || 'root',
            password: DB_PASS || ''
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'edumini'}\`;`);
        console.log(`Database '${DB_NAME || 'edumini'}' created or already exists.`);
        await connection.end();
    } catch (error) {
        console.error('Error creating database:', error);
        process.exit(1);
    }
};

module.exports = createDB;
