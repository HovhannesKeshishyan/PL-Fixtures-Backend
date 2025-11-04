import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import StatusCodes from "http-status-codes";

process.loadEnvFile();

import corsConfig from "./configs/cors-config.js";
import rateLimitConfig from "./configs/rate-limit-config.js";

import router from "./routes/index.js";

const PORT = process.env.PORT || 3000;

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
    res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).send(err.message || "Server Error");
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

//for Vercel deploy
export default app;