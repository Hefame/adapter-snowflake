process.MICRONAME = "ADAPTER-SNOWFLAKE";
import SnowFlake from "./backends/SnowFlake.mjs";
import expressApp from "./services/expressApp.mjs";
import logger from "./utils/logger.mjs";

const main = async () => {
	logger.info(`Iniciando servicio ${process.MICRONAME}`);
	await expressApp({
		puerto: parseInt(process.env.EXPRESS_PORT, 10) || 3000,
		parsers: {
			json: {
				activo: true,
				opciones: { limit: "1mb" },
			},
		},
	});

	try {
		let resultado = await SnowFlake.ejecutarSentencia({
			sql: `INSERT INTO "DB_HEFAME_EDWH_PRO"."CONSULTAS_STOCK"."FEDICOM2" (fecha) VALUES (:1)}`,
			binds: ["2020-03-23T13:45:56.000Z"],
		});
	} catch (error) {
		logger.error(`Error al llamar a SnowFlake: ${error.message}`);
	}
};

main().catch((error) => {
	logger.fatal("La aplicación a tenido un error irrecuperable:", error);
});

export {};
