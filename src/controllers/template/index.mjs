import MongoDBTemplate from "../../backends/MongoDBTemplate.mjs";
import AxiosTemplate from "../../backends/AxiosTemplate.mjs";
import logger from "../../utils/logger.mjs";
import express from "express";
import MariaDBTemplate from "../../backends/MariaDBTemplate.mjs";
import RabbitTemplate from "../../backends/RabbitTemplate.mjs";
import HError from "../../model/HError.mjs";
const router = express.Router({ mergeParams: true });

// POST /template
router.post("/", async (req, res) => {
	logger.info("Petición de prueba");

	try {
		// Ejemplo de consulta MariaDB
		const respuestaMaria = await MariaDBTemplate.consultaMaria();

		// Ejemplo de consulta MongoDB
		const respuestaMongo = await MongoDBTemplate.consultaMongo();

		// Ejemplo consulta AXIOS
		const respuestaAxios = await AxiosTemplate.consultaAxios(20230410120000.0, 20230410120001.0);

		// Ejemplo de publicación en Rabbit
		await RabbitTemplate.publicar("test", "test.webo", Buffer.from(JSON.stringify({ ola: "caracola" })));

		res.json({ stock: 1, body: req.body, mongo: respuestaMongo, axios: respuestaAxios, maria: respuestaMaria });
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
