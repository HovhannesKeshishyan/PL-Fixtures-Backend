// Loads .env and validates environment variables.
// Must be the first import in src/index.js, before any module that reads process.env.
import "dotenv/config";
import {z} from "zod";

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).optional(),
    PORT: z.coerce.number().int().positive().optional(),
    API_KEY: z.string(),
    GEMINI_API_KEY: z.string(),
    OPENAI_API_KEY: z.string(),
    FRONT_END_ORIGIN: z.string().optional(),
    REDIS_URL: z.string().optional(),
    SENTRY_DSN: z.string().optional(),
});

// treat empty values (e.g. "API_KEY=" in .env) as not set
const definedEnv = Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== "")
);

const result = EnvSchema.safeParse(definedEnv);
if (!result.success) {
    const problems = result.error.issues
        .map(issue => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
    throw new Error(`Invalid environment variables:\n${problems}`);
}
