//requring the env file
const env=require('dotenv').config();
//creating the base url
const base_url=`http://${process.env.HOST}:${process.env.PORT}/uploads`

//exportong the nbase url
module.exports=base_url;
console.log(`The ${base_url} is active`);
