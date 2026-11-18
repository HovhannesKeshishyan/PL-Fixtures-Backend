import {createClient} from "redis";
import "dotenv/config";

const INITIAL_CONNECT_MAX_RETRIES = 3;
const MAX_RECONNECT_DELAY_MS = 3000;

class Database {
    static instance = null;
    client = null;

    constructor() {
        if (Database.instance) return Database.instance;
        Database.instance = this;
    }

    async connect() {
        if (this.client) return this.client;

        let client = null;
        let hasConnected = false;

        try {
            client = createClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries, cause) => {
                        // Give up on the initial connection so startup doesn't hang forever,
                        // but keep retrying once a connection has been established.
                        if (!hasConnected && retries >= INITIAL_CONNECT_MAX_RETRIES) return cause;
                        return Math.min(retries * 200, MAX_RECONNECT_DELAY_MS);
                    },
                },
            });

            // node-redis throws (and crashes the process) on "error" events when no listener is registered
            client.on("error", (err) => console.error("Redis client error:", err.message || err.code || err));

            await client.connect();
            hasConnected = true;
            this.client = client;
            console.log("Connected to Redis");
        } catch (err) {
            console.error("Failed to connect Redis:", err.message || err.code || err);
            if (client?.isOpen) client.destroy();
            this.client = null;
        }

        return this.client;
    }

    getClient() {
        return this.client;
    }
}

export const DB = new Database();
