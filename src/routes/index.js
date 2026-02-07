import express from "express";
const router = express.Router();

import {getHomePage} from"../controllers/v1/homeController.js";

import routerV1 from "./v1/index.js"
import routerV2 from "./v2/index.js"

router.get("/", getHomePage);

router.use("/api/v1", routerV1);
router.use("/api/v2", routerV2);

export default router;