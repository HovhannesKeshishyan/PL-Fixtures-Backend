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
const IS_VERCEL = !!process.env.VERCEL;

const app = express();
// on Vercel requests come through a proxy, trust it so rate limiting uses the real client IP
if (process.env.VERCEL) app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsConfig));
app.use(rateLimit(rateLimitConfig));
app.use(express.json());
app.use(router);

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

const isValidErrorStatus = (status) => Number.isInteger(status) && status >= 400 && status < 600;

// Errors safe to show to the client:
// - errors created in this app with `new Error()` and an explicit status
// - Express/body-parser errors marked with `expose` (e.g. invalid JSON)
// Other errors (axios, OpenAI, Gemini, ...) may contain internal details, so they get a generic 500.
const isClientSafeError = (err) => isValidErrorStatus(err.status) && (err.constructor === Error || err.expose === true);

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

    if (isClientSafeError(err)) {
        return res.status(err.status).send(err.message);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
}

// on Vercel the exported app is used as the request handler, no server needed
if (!IS_VERCEL) {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

//for Vercel deploy
export default app;