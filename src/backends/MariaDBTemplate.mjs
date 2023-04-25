import logger from "../utils/logger.mjs";
import HError from "../model/HError.mjs";
import mariadb from "mariadb";

/**
 * El nombre se utiliza para determinar de manera estandar el nombre de las variables de entorno
 * esperadas.
 */
const NOMBRE = "TEMPLATE";

const getEntorno = (nombreVariable) => {
	return process.env[`MARIADB_${NOMBRE}_${nombreVariable}`];
};

const log = logger.generarSubnivel("mariadb", NOMBRE.toLowerCase());

class MariaDBTemplate {
	static #pool;

	static async #getPool() {
		if (!MariaDBTemplate.#pool) {
			const conf = {
				host: getEntorno("HOST"),
				port: parseInt(getEntorno("PORT")) || 3306,
				user: getEntorno("USER"),
				password: getEntorno("PASSWORD"),
				database: getEntorno("DB"),
				connectionLimit: parseInt(getEntorno("MAXCONN")) || 5,
			};
			MariaDBTemplate.#pool = mariadb.createPool(conf);
			log(`Pool de conexiones creado con la base de datos ${conf.user}@${conf.host}:${conf.host}/${conf.database}`);
		}
		return MariaDBTemplate.#pool;
	}

	static async #getConexion() {
		return (await MariaDBTemplate.#getPool()).getConnection();
	}

	static async consultaMaria() {
		const _inicio = Date.now();
		let conexion;

		try {
			conexion = await MariaDBTemplate.#getConexion();
			const datos = await conexion.query("select * from agent_agents where arch = ?", ["amd64"]);
			const _fin = Date.now();
			log(`consultaMaria - ${_fin - _inicio}ms - ${datos.length ?? 1} registros`);
			return datos;
		} catch (error) {
			const _fin = Date.now();
			log(`consultaMaria - ${_fin - _inicio}ms - Error: ${error.message} `);
			throw HError.from(error);
		} finally {
			if (conexion) conexion.end();
		}
	}
}
export default MariaDBTemplate;
