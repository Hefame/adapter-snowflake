import logger from "../utils/logger.mjs";

/**
 * El nombre se utiliza para determinar de manera estandar el nombre de las variables de entorno
 * esperadas.
 */
const NOMBRE = "TEMPLATE";
const getEntorno = (nombreVariable) => {
	return process.env[`SCHED_${NOMBRE}_${nombreVariable}`];
};

const log = logger.generarSubnivel("sched", NOMBRE.toLowerCase());

const operar = async () => {
	// Aquí es donde va el código que se ejecutará periodicamente
	logger.debug("El intervalo se ejecuta, si ¿o qué?");
};

const schedulerTemplate = async () => {
	const tiempoEspera = (parseInt(getEntorno("INTERVAL"), 10) || 5) * 1000;

	log("Inicio del intervalo");
	const _inicio = Date.now();

	try {
		await operar();
	} catch (error) {
		log(`Ocurrió una excepción no controlada durante la ejecución del intervalo: ${error.message}`);
	}
	const _fin = Date.now();
	log(`Ejecución finalizada - ${_fin - _inicio}ms - Próxima ejecución en ${tiempoEspera}ms`);

	setTimeout(schedulerTemplate, tiempoEspera);
};

export default schedulerTemplate;
