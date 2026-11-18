import "dotenv/config";
import StatusCodes from "http-status-codes";

const isLocalhost = (origin) => {
    try {
        const url = new URL(origin);

        return (
            url.protocol === "http:" &&
            ["localhost", "127.0.0.1"].includes(url.hostname)
        );
    } catch {
        return false;
    }
};

// FRONT_END_ORIGIN can contain several origins separated by commas
const allowedOrigins = (process.env.FRONT_END_ORIGIN || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

const isOriginAllowed = (origin) => {
    if (!origin) return true;

    if (allowedOrigins.includes(origin)) return true;

    return !!(process.env.NODE_ENV !== "production" && isLocalhost(origin));
}

const corsConfig = {
    origin: function (origin, callback) {
        // allow allowed origins and requests without origin (e.g. Postman, server-to-server)
        callback(null, isOriginAllowed(origin));
    },
    methods: ["HEAD", "GET", "POST"],
    optionsSuccessStatus: StatusCodes.NO_CONTENT,  // Respond with a 204 No Content on preflight requests
};

export default corsConfig;