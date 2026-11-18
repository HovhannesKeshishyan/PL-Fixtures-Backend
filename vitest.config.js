import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["tests/**/*.test.js"],
        setupFiles: ["tests/setup.js"],
        unstubEnvs: true,
        // fake values only: the real .env (with real API keys) is never loaded in tests
        env: {
            DOTENV_CONFIG_PATH: "tests/.env.does-not-exist",
            NODE_ENV: "development",
            API_KEY: "test-football-data-key",
            GEMINI_API_KEY: "test-gemini-key",
            OPENAI_API_KEY: "test-openai-key",
            FRONT_END_ORIGIN: "https://frontend.test, https://www.frontend.test",
            REDIS_URL: "",
            SENTRY_DSN: "",
            VERCEL: "",
        },
    },
});
