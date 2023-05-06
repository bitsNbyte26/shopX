const cors = require('cors');
const dotenv = require('dotenv');
const express = require("express");
const mongoose = require('mongoose')
const httpContext = require("express-http-context");
const notFound = require("./errors/notFound");
const errorHandler = require("./errors/errorHandler");
const path = require('path')
const router = require("./routes");

const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

// Load environment variables
dotenv.config();
// Create Express server
const app = express();

//public 
app.use('/public',express.static('public'))


// Connecting Database
mongoose.connect(process.env.MONGO_URI,()=>{
    app.listen(process.env.PORT);
    console.log("App is running at http://localhost:%d ",process.env.PORT);
});


// Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// CORS configuration
app.use(cors(corsOptions));
app.options("*", cors);

// Set HTTP context
app.use(httpContext.middleware);


app.use(router);

// Error handling
app.use(errorHandler)
app.use(notFound);

module.exports = app;
