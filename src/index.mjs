process.MICRONAME = "ADAPTER-SNOWFLAKE";
import SnowFlake from "./backends/SnowFlake.mjs";
import expressApp from "./services/expressApp.mjs";
import logger from "./utils/logger.mjs";

const main = async () => {
	logger.info(`Iniciando servicio ${process.MICRONAME}`);
	await expressApp({
		puerto: parseInt(process.env.EXPRESS_PORT, 10) || 3000,
		parsers: {
			raw: {
				activo: true,
				opciones: { inflate: true, limit: process.env.EXPRESS_MAX_BODY_SIZE || "200mb", type: "*/*" },
			},
		},
	});
};

main().catch((error) => {
	logger.fatal("La aplicación a tenido un error irrecuperable:", error);
});

export {};
