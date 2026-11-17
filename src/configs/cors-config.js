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

const isOriginAllowed = (origin) => {
    if (!origin) return true;

    if (origin === process.env.FRONT_END_ORIGIN) return true;

    return !!(process.env.NODE_ENV !== "production" && isLocalhost(origin));
}

const corsConfig = {
    origin: function (origin, callback) {
        // Check if the origin is in the allowedOrigins array or if it is undefined (e.g., Postman)
        if (isOriginAllowed(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ["HEAD", "GET", "POST"],
    credentials: true,  // Enable credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: StatusCodes.NO_CONTENT,  // Respond with a 204 No Content on preflight requests
};

export default corsConfig;