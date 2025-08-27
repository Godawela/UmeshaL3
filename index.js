const mongoose = require('mongoose');
require('dotenv').config();

const deviceRoutes = require('./routes/deviceRoutes'); // Correct path
const symptomRoutes = require('./routes/symptomRoutes'); // Correct path
const userRoutes = require('./routes/userRoutes'); // Correct path
const noteRoutes = require('./routes/noteRoutes'); // Correct path
const categoryRoutes = require('./routes/categoryRoutes'); // Correct path
const quickTipRoutes = require('./routes/quickTipRoutes'); // Correct path for quick tips
const questionRoutes = require('./routes/questionRoutes'); // Correct path for questions


const port = process.env.PORT || "8000";

const path = require('path');
const express = require('express');
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dbURI = process.env.DB_URI;

mongoose
    .connect(dbURI)
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));

mongoose.Promise = global.Promise;

// Use the routes
app.use('/api', deviceRoutes);
app.use('/api', symptomRoutes);
app.use('/api', userRoutes); 
app.use('/api', noteRoutes); 
app.use('/api', categoryRoutes);
app.use('/api/quicktips', quickTipRoutes);
app.use('/api', questionRoutes);


app.get('/', (req, res) => {
    res.send('Hello from Express!!');
});

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

module.exports = app;
