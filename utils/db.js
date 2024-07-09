const mariadb = require("mariadb");

async function getConnection() {
    try {
        return await mariadb.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            database: process.env.MYSQL_DB
        });
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function query(query, params) {
    let res = null;
    let conn = null;
    try {
        conn = await getConnection();
        const _query = query.replace(/\?/g, () => {
            if (params.length === 0) return '?';
            return params.shift();
        });
        res = await conn.query(_query);
    }
    catch (err) {
        console.error(err);
        return null;
    }finally {
        if (conn) conn.end();
    }

    return res;
}

module.exports = {
    getConnection,
    query
};