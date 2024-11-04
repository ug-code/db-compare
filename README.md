# db-compare
 Compares two databases
![image](https://github.com/user-attachments/assets/33d4ae27-f14d-43cb-a8fc-1f2e5e9edb2a)

## Installation
coming soon

## Usage
``` javascript
const config1 = {
    user: '',
    password: '',
    database: '',
    server: '',
    port: 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

const config2 = {
    user: '',
    password: '',
    database: '',
    server: '',
     port: 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}


const mssql = new Mssql(config1, config2);
mssql.compareTables().then((data) => {
});

```
![image](https://github.com/ug-code/db-compare/assets/17679067/6fb738c8-f39b-422e-ab24-079c5516ef9d)

## Test
Tested on SQL server 2019 15.0.2000.5  

## Collaborate

Please feel free to report feedback or bugs or ask for new features.
