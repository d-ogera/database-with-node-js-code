const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotnev = require('dotenv');


//initialize
const app = express();

//middlewares
app.use(express.json());
app.use(cors());
dotnev.config();

//database connection

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

//check that database server connection is successful
connection.connect((err)=>{
    if(err) return console.log(err);
    console.log('Database Server connected successfully');


connection.query('CREATE DATABASE IF NOT EXISTS expense_users', (err, result) => {
    if(err) return console.log(err);
    console.log('Database expense_users successfully created'); 
   

    connection.query('USE expense_users', (err, result) => {
        if(err) return console.log(err);
        console.log('Database selected successfully');
    });

    //create user
const query = `CREATE TABLE IF NOT EXISTS  users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
        )`;
connection.query(query, (err, result) =>{
    if(err) return console.log(err);
    console.log('Users table created successfully');

        });
    });
});

//user registration
app.post('/api/user/register',async(req, res) => {
  try{

            //hashing the password
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(req.body.password, salt)
       
    const users = 'SELECT * FROM users WHERE email = ?'
    //check if user exists
    connection.query(users, [req.body.email], (err, data) =>{
        //if we find user with same email in database
        if(data.length > 0) return res.status(409).json("user already exists");

 //query to create user
        const newUser = `INSERT INTO users(email, username, password) VALUES (?)`
        value = [ req.body.email, req.body.username, hashedPassword]

        connection.query(newUser, [value], (err) => {
            if(err) return console.log(err);
            return res.status(201).json("User created successfully")
        })
    })
}  
catch(err){
    res.status(500).json("Internal server error")
}
})

app.listen(3300, ()=>{
console.log('My server running well at port 3300');
});