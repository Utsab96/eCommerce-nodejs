//requring the mysql
const mysql=require('mysql');
//requiring the env file
const env=require('dotenv').config();
//creating the database globally 
//creating the database credentials

var db=mysql.createConnection({
    port:process.env.DB_PORT,
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
    // host: 'mysql', // Container name as defined in docker-compose.yml
    // user: 'root',
    // password: 'password',
    // database: 'ecommerce',
    // port: 3306 
})

//testing the connection

db.connect((error)=>{
    if(error){
        console.log(error); 
    }
    else{
        console.log(`Succesfully connected to database`);  
    }

})
//exporting the database
module.exports=db;