import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import "dotenv/config";
import StatusCodes from "http-status-codes";
import * as Sentry from "@sentry/node";

import "./configs/instrument.js";
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

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

const IS_VERCEL = !!process.env.VERCEL;

async function errorHandler(err, req, res, _next) {
    console.log("***** ERROR LOG *****");
    console.log(err);
    console.log("***** ERROR LOG *****");

    if (IS_VERCEL) {
        // On Vercel, serverless functions may terminate immediately after the response.
        // Adding `await Sentry.flush()` ensures the error is fully sent to Sentry before the function ends.
        Sentry.captureException(err);
        await Sentry.flush();
    }

    res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).send(err.message || "Server Error");
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

//for Vercel deploy
export default app;