const mariadb = require("mariadb");
const pgAsync = require("pg-async");

async function getAltConnection(){
    try{
        return new pgAsync({
            host: process.env.ALT_DB_HOST,
            user: process.env.ALT_DB_USER,
            password: process.env.ALT_DB_PASSWORD,
            database: process.env.ALT_DB_DATABASE,
            port: process.env.ALT_DB_PORT
        })
    }catch(err){
        console.error(err);
        return null;
    }
}

async function getInspectorConnection() {
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

async function queryAlt(query, params) {
    let res = null;
    let conn = null;
    try {
        conn = await getAltConnection();
        res = await conn.query(query, params);
    }
    catch (err) {
        console.error(err);
        return null;
    }finally {
        if (conn) conn.end();
    }

    return res;

}

async function queryInspector(query, params) {
    let res = null;
    let conn = null;
    try {
        conn = await getInspectorConnection();
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
    getInspectorConnection,
    queryInspector
};