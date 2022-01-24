const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const path = require('path');
const PORT = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

if(process.env.NODE_ENV == 'production'){
    app.use(express.static(path.join(__dirname,"client/build")))
}

//ROUTES

app.post("/todos", async(req,res)=>{
    try{
        const todoData = req.body;
        console.log(todoData);
        const newTodo = await pool.query(
            "INSERT INTO tasks (title, pointAmt) VALUES($1, $2) RETURNING *",
            [todoData.title, todoData.pointAmt]
        )
        res.send('hello');
    }catch(err){
        console.error(err.message);
    }
})

app.get("/todos", async(req,res)=>{
    try{
        const todos = await pool.query("SELECT * FROM tasks");
        res.json(todos.rows);
    }catch(err){
        console.error(err.message);
    }
})

app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`)
})