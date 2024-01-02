const BaseDriver = require('./baseDriver');
const sql = require('mssql')
const fs = require('fs');

class Mssql extends BaseDriver {
    connection = null;
    fConfig = {}
    sConfig = {}

    compareType = {
        FOREIGN_KEYS: 'F',
        FUNCTIONS: 'TF',
        TABLES: 'U',
        VIEWS: 'V',
        PROCEDURE: 'P',
    };

    constructor(fConfig = {}, sConfig) {
        super();
        this.fConfig = fConfig;
        this.sConfig = sConfig;


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

    async firstTable(query) {
        const data = await this.select(query, this.fConfig);
        return this.prepareOutArray(data.recordset);
    }

    async secondTable(query) {
        const data = await this.select(query, this.sConfig);
        return this.prepareOutArray(data.recordset);
    }

    async compareTables() {
        const query = this.getSql(this.compareType.TABLES);
        let firstTable = await this.firstTable(query);
        let secondTable = await this.secondTable(query);
        //fs.writeFileSync('prepareOutArray1.json', JSON.stringify(firstTable));
        //fs.writeFileSync('prepareOutArray2.json', JSON.stringify(secondTable));


        let allTables = [...new Set([...Object.keys(firstTable), ...Object.keys(secondTable)])];
        allTables.sort();
        let out = {};
        for (let v of allTables) {
            let allFields = [...new Set([...Object.keys(firstTable[v] || {}), ...Object.keys(secondTable[v] || {})])];
            for (let f of allFields) {

                const checkFTable = firstTable[v]?.[f];
                const checkSTable = secondTable[v]?.[f];
                switch (true) {
                    case (!checkFTable):
                    {
                        if (checkSTable){
                            secondTable[v][f]['isNew'] = true;
                        }
                        break;
                    }
                    case (!checkSTable):
                    {
                        if (checkSTable){
                            firstTable[v][f]['isNew'] = true;
                        }
                        break;
                    }
                    case (checkFTable['dType'] && checkSTable['dType'] && (checkFTable['dType'] !== checkSTable['dType'])):
                    {
                        firstTable[v][f]['changeType'] = true;
                        secondTable[v][f]['changeType'] = true;
                        break;
                    }
                }
            }
            out[v] = {
                firstTable: firstTable[v],
                secondTable: secondTable[v]
            };
        }


        //fs.writeFileSync('test1.json', JSON.stringify(out));

        //compare db
        return out;

    }

    prepareOutArray(data) {

        let mArray = {};
        data.forEach(r => {
            mArray[r['dbName']] = mArray[r['dbName']] || {};
            mArray[r['dbName']][r['columnName']] = r;
        });
        return mArray;
/*
        const groupsDbName = data.reduce((x, y) => {
            (x[y.dbName] = x[y.dbName] || []).push(y);
            return x;
        }, {});
        fs.writeFileSync('groupsDbName.json', JSON.stringify(groupsDbName));

        const groupsData = {};

        for (const [key, value] of Object.entries(groupsDbName)) {
            const columnNameGroup = value.reduce((x, y) => {
                (x[y.columnName] = x[y.columnName] || []).push(y);
                return x;
            }, {});
            groupsData[key] =(columnNameGroup);

            break;
          //  groupsData[key] = columnNameGroup;

        }
        fs.writeFileSync('prepareOutArray.json', JSON.stringify(groupsData));
        return groupsData;

 */
    }


    getSql(type) {
        return `SELECT DISTINCT
                    sc.name AS columnName,
                    st.name  + '(' + CAST(sc.length AS varchar(10)) + ')' AS dType ,
                    so.name AS dbName,
                    sc.colorder
        FROM
                <<BASENAME>>..syscolumns sc,
                <<BASENAME>>..systypes st,
                <<BASENAME>>..sysobjects so
        WHERE
                sc.id = so.id AND
                sc.xtype = st.xtype AND
                sc.xusertype=st.xusertype AND
                so.xtype='${type}'
        ORDER BY so.name,sc.colorder`;
    }

    async select(query, config = {}) {
        const database = config?.database ?? null;

        let out = [];
        const cleanQuery = query.replaceAll('<<BASENAME>>', database)
        await sql.connect(config);

        const result = await sql.query(cleanQuery);
        await sql.close();
        return result;


    }
}

module.exports = Mssql;
