require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const { generateText } = require('ai');


app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DB_URL).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});

const recipeSchema = new mongoose.Schema({
    title: String,
    ingredients: [String],
    instructions: String,
})

const RecipeModel = mongoose.model('Recipe', recipeSchema);

app.get('/recipes', async (req, res) => {
    try {
        const recipes = await RecipeModel.find();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/recipes', (req, res) => {
    RecipeModel.insertOne({title: req.body.title, ingredients: req.body.ingredients, instructions: req.body.instructions});
    res.send({message: 'Recipe created'});
});

app.post('/recipes/generate', async (req, res) => {
    const title = req.body.title;
    const ingredients = req.body.ingredients;
    console.log("title: ", title);
    console.log("ingredients: ", ingredients);

    const { text } = await generateText({
        model: "anthropic/claude-sonnet-4.5",
        prompt: `generate a recipe for ${title} with the following ingredients: ${ingredients}`,
      });
      console.log("text: ", text);

      res.send({recipe: text});
});
app.get('/', (req, res) => {
    res.send({message: 'Hello World'});
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});