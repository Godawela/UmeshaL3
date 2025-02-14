const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const deviceRoutes = require('./routes/deviceRoutes'); // Correct path
const port = process.env.PORT || "8000";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const dbURI = process.env.DB_URI || "mongodb+srv://udayanga:udayanga@udayanga.yebyk.mongodb.net/";

mongoose
    .connect(dbURI)
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));

mongoose.Promise = global.Promise;

// Use the routes
app.use('/api', deviceRoutes);

app.get('/', (req, res) => {
    res.send('Hello from Express!!');
    console.log('Hi Express!!');
});

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

module.exports = app;
