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
		let resultado = await SnowFlake.cargarFichero();
		logger.debug(resultado);
	} catch (error) {
		logger.error(`Error al llamar a SnowFlake: ${error.message}`);
	}

	/*
	try {
		let resultado = await SnowFlake.ejecutarSentencia({
			sql: `INSERT INTO "HEFAME_PRO"."SH_STAGING"."TB_STG_CATALOGOS" (ID, PRICE, COMPETENCE, DATE) VALUES (:1, :2, :3, :4)`,
			binds: ["000017", 58.78, "BIDAFARMA", "2023-04-24"],
		});

		
		logger.debug(resultado);
	} catch (error) {
		logger.error(`Error al llamar a SnowFlake: ${error.message}`);
	}*/
};

main().catch((error) => {
	logger.fatal("La aplicación a tenido un error irrecuperable:", error);
});

export {};
