import {createClient} from "redis";

process.loadEnvFile();

class Database {
    static instance = null;
    client = null;

    constructor() {
        if (Database.instance) return Database.instance;
        Database.instance = this;
    }

    async connect() {
        if (this.client) return this.client;

        try {
            this.client = await createClient({url: process.env.REDIS_URL});
            await this.client.connect();
            console.log("Connected to Redis");
        } catch (err) {
            console.error("Failed to connect Redis:", err);
            this.client = null;
        }

        return this.client;
    }

    getClient() {
        return this.client;
    }
}

export const DB = new Database();