const express = require('express');
require("dotenv").config();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const {INTERNAL_SERVER_ERROR} = require("http-status-codes");

const PORT = process.env.PORT || 3000;
const corsConfig = require("./configs/cors-config");
const rateLimitConfig = require("./configs/rate-limit-config");

const router = require("./routes");

const app = express();
app.use(helmet());
app.use(cors(corsConfig));
app.use(rateLimit(rateLimitConfig));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(router);

app.use(errorHandler);

function errorHandler(err, req, res, _next) {
    console.log("***** ERROR LOG *****");
    console.log(err);
    console.log("***** ERROR LOG *****");
    res.status(err.status || INTERNAL_SERVER_ERROR).send(err.message || "Server Error");
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

//for Vercel deploy
module.exports = app;