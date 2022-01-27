const axios = require("axios");
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const path = require('path');
const PORT = process.env.PORT || 5000;
// CHANGE WHEN WE HAVE ACTUAL USER ACCOUNTS
const userID = 1;

//middleware
app.use(cors());
app.use(express.json());

if(process.env.NODE_ENV == 'production'){
    app.use(express.static(path.join(__dirname,"client/build")))
}

//ROUTES

// Todos
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

app.delete("/todos/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const toDelete = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
        res.json(toDelete.rows);     
    } catch (err) {
        console.log(err.message);
        
    }
})

// Eggs

app.get('/eggs', async(req,res) =>{
    try {
        const eggs = await pool.query("SELECT * FROM eggs");
        res.json(eggs.rows);
    } catch (error) {
        console.error(error.message);
    }
});

app.post('/hatch', async(req,res) =>{
    try {
        const eggData = req.body;
        const id = eggData.id;
        const response = await pool.query("SELECT isHatchable, id, name, image FROM eggs WHERE id = $1",[id]);
        const egg = response.rows[0];
        console.log(egg);
        if(egg.ishatchable){
            const pokemonResponse = await pool.query("INSERT INTO pokemon (name, image) VALUES ($1, $2)", [egg.name, egg.image]);
            console.log(pokemonResponse);
            const deleteResponse = await pool.query("DELETE FROM eggs WHERE id = $1", [id]);
            console.log(deleteResponse);
            res.json(egg);
        }else{
            res.send("Not ready to hatch yet");
            return
        }
    } catch (error) {
        console.error(error.message);
    }
})

app.post('/store', async(req,res) =>{
    try {
        /*
            Capture will determine the user's capture value and compare it to a pokemon's capture value, thereby determining what the pokemon in the pokeegg will be.
        */
        const response = await pool.query("SELECT points FROM users WHERE id = $1", [userID]);
        const jsonPoints = response.rows[0].points;
        if(jsonPoints < 1000){
            res.send("Insufficient points");
            return
        }else{
            const remPoints = jsonPoints - 1000;
            pool.query("UPDATE users SET points = $1 WHERE id = $2", [remPoints, userID]);
        }
        const MAXCAPTUREVALUE = 254; // Determined by the pokemon defined max capture value of 255
        const NUMPOKEMON = 150; // Number of pokemon to work with (currently Gen 1)
        let userCaptureRoll = Math.floor(Math.random()*MAXCAPTUREVALUE +1); // Give a random value [1, 255] for the user to capture pokemon with
        /* 
        If the capture roll is LESS THAN OR EQUAL TO the capture value, pokemon is caught.
        Therefore, if capture roll is GREATER THAN the capture value, we need to roll again.
        */
        do{ 
            POKENUMBER = Math.floor(Math.random()* NUMPOKEMON +1); // Generate the next random pokemon number
            pokeAPICall = await axios.get('https://pokeapi.co/api/v2/pokemon-species/' + POKENUMBER); // API call that has capture_rate data
            data = pokeAPICall.data;
            pokeCaptureValue = data.capture_rate; // Capture value of the random pokemon
        }while(userCaptureRoll > pokeCaptureValue)

        const ptsRemaining = 255*(data.hatch_counter+1); // Formula from hatch rate description of pokeAPI
        const pokemonImage = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + POKENUMBER + '.png';
        const pokeName =  data.name[0].toUpperCase() + data.name.slice(1);

        console.log(pokeName);

        // Create a new Egg row 
        const newEgg = await pool.query("INSERT INTO eggs (stepsToHatch, name, image) VALUES ($1, $2, $3) RETURNING *", [ptsRemaining, pokeName, pokemonImage]);
        res.send(newEgg.rows);
    } catch (error) {
        console.error(error.message);
    }
})

app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`)
})