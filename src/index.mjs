process.MICRONAME = "APIGW-ARACNIDA";
import expressApp from "./services/expressApp.mjs";
import schedulerTemplate from "./services/schedulerTemplate.mjs";
import suscripcionRabbit from "./services/suscripcionRabbit.mjs";
import logger from "./utils/logger.mjs";

const main = async () => {
	logger.info(`Iniciando servicio ${process.MICRONAME}`);
	await expressApp({
		puerto: parseInt(process.env.EXPRESS_PORT, 10) || 3000,
		parsers: {
			raw: {
				activo: true,
				opciones: {
					inflate: true,
					limit: "1mb",
					type: "*/*",
				},
			},
		},
	});

	try {
		await suscripcionRabbit();
	} catch (error) {
		logger.fatal("Error al suscribirse al servicio Rabbit:", error);
	}

	schedulerTemplate();
};

main().catch((error) => {
	logger.fatal("La aplicación a tenido un error irrecuperable:", error);
});

export {};
