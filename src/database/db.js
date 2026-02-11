
const { Sequelize } = require('sequelize');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

// Supabase Session Pooler Fix (IPv6 bypass): Use port 6543 instead of 5432
let dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('supabase.co') && dbUrl.includes(':5432')) {
    dbUrl = dbUrl.replace(':5432', ':6543');
    console.log('🔄 Switched to Supabase Session Pooler (Port 6543)');
}

const sequelize = isProduction
    ? new Sequelize(dbUrl, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    })
    : new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../database.sqlite'),
        logging: false,
    });

module.exports = sequelize;
