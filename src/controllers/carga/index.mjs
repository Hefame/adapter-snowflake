import logger from "../../utils/logger.mjs";
import express from "express";
import HError from "../../model/HError.mjs";
import SnowFlake from "../../backends/SnowFlake.mjs";
const router = express.Router({ mergeParams: true });

// POST /carga
router.post("/", async (req, res) => {
	
	try {
		let sf_database = req.headers["x-database"];
		let sf_schema = req.headers["x-schema"];
		let sf_table = req.headers["x-table"];
		let type = req.headers["content-type"];

		logger.info(`Petición de carga de datos SnowFlake: ${sf_database}.${sf_schema}.${sf_table}`);

		let resultado = await SnowFlake.cargar(sf_database, sf_schema, sf_table, req.body, { type });

		logger.info(resultado);

		res.json(resultado);
	} catch (error) {
		const herror = HError.from(error);
		logger.error(`Error durante la operación:`, error);
		herror.express(res);
	}
});

export default router;
