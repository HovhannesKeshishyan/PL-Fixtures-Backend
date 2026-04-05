import express from "express";
const router = express.Router();

import {getHomePage} from"../controllers/v1/homeController.js";

import routerV1 from "./v1/index.js"
import routerV2 from "./v2/index.js"

router.get("/", getHomePage);

router.use("/api/v1", routerV1);
router.use("/api/v2", routerV2);

//  todo remove this endpoint after successful test
router.use("/test/sentry-error", (req, res) => {
    const message = req.body.message || Date.now();
    throw new Error(`Test Sentry error ${message}`);
})

export default router;