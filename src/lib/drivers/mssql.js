const BaseDriver = require('./baseDriver');
const sql = require('mssql')

class Mssql extends BaseDriver {
    connection = null;
    config = {}

    compareType = {
        FOREIGN_KEYS: 'F',
        FUNCTIONS: 'TF',
        TABLES: 'U',
        VIEWS: 'V',
        PROCEDURE: 'P',
    };

    constructor(config = {}) {
        super();
        this.config = config;


    }

    async connect() {
        this.connection = await sql.connect(this.config)
    }

    async executeStatementTest() {

        try {
            // make sure that any items are correctly URL encoded in the connection string
            await sql.connect(this.config);
            const result = await sql.query`select * from T_TRUSTED_APP`;
            return result;
        } catch (err) {
            // ... error checks
            console.log("err", err);
        }

    }

    async compareTables() {
        const query = this.getSql(this.compareType.TABLES);
        const select = await this.select(query);
        return select;
    }

    getSql(type) {
        return `SELECT DISTINCT
                    sc.name AS ARRAY_KEY_2,
                    st.name  + '(' + CAST(sc.length AS varchar(10)) + ')' AS dtype ,
                    so.name AS ARRAY_KEY_1,
                    colorder
        FROM
                <<BASENAME>>..syscolumns sc,
                <<BASENAME>>..systypes st,
                <<BASENAME>>..sysobjects so
        WHERE
                sc.id = so.id AND
                sc.xtype = st.xtype AND
                so.xtype='${type}'
        ORDER BY so.name`;
    }

    async select(query) {
        const database = this.config?.database ?? null;

        let out = [];
        const cleanQuery = query.replaceAll('<<BASENAME>>', database)
        await sql.connect(this.config);

        const result = await sql.query(cleanQuery);
        return result;


    }
}

module.exports = Mssql;
