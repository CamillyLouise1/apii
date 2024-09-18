import mysql from "mysql2";

const conn = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
})

conn.query("SELECT 1 + 1 AS Solution", (error, result) => {
    if(error){
        console.error(error);
        return;
    }
    console.log("The solution is: ", result[0].solution);
});

export default conn;