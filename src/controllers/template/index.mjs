import logger from "../../utils/logger.mjs";
import express from "express";
import HError from "../../model/HError.mjs";
const router = express.Router({ mergeParams: true });

// POST /template
router.post("/", async (req, res) => {
	logger.info("Petición de prueba");

	try {
		res.json({ stock: 1, body: req.body });
	} catch (error) {
		const herror = HError.from(error);
		logger.error("Error durante la operación: ", error);
		herror.express(res);
	}
});

// GET /template
router.get("/", async (req, res) => {
	res.json({ stock: 1 });
});

export default router;
