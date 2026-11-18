import app from "./app.js";

const PORT = process.env.PORT || 3000;

// on Vercel the exported app is used as the request handler, no server needed
if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

//for Vercel deploy
export default app;
