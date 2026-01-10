// backend/routes/quoteRoutes.js
import express from "express";
import { createQuote } from "../controllers/quoteController.js";

const router = express.Router();
router.post("/", createQuote);

export default router;
