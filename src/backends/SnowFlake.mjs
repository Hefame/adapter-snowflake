// https://github.com/snowflakedb/snowflake-connector-nodejs/issues/365
import error_aws_v3 from "aws-sdk/lib/maintenance_mode_message.js";
error_aws_v3.suppress = true;
//

import logger from "../utils/logger.mjs";
import snowflake from "snowflake-sdk";
import crypto from "crypto";
import { writeFile, unlink } from "node:fs/promises";

const getEntorno = (nombreVariable) => {
	return process.env[`SNOWFLAKE_${nombreVariable}`];
};

const log = logger.generarSubnivel("snowflake", getEntorno("ACCOUNT").toLowerCase());

class SnowFlake {
	static #conexion;

	static async #getConnection() {
		return new Promise((resolve, reject) => {
			if (!SnowFlake.#conexion) {
				const cliente = snowflake.createConnection({
					account: getEntorno("ACCOUNT"),
					username: getEntorno("USER"),
					password: getEntorno("PASS"),
					application: process.MICRONAME,
				});

				log(`Conectando con la cuenta SnowFlake`);
				cliente.connect((error, conn) => {
					if (error) {
						log(`Ocurrió un error durante la conexión: ${error.message}`);
						reject(error);
					} else {
						log(`Conexión establecida`);
						SnowFlake.#conexion = conn;
						resolve(SnowFlake.#conexion);
					}
				});
			} else {
				resolve(SnowFlake.#conexion);
			}
		});
	}

	static async #resetConnection() {
		SnowFlake.#conexion = null;
		return await SnowFlake.#getConnection();
	}

	static async ejecutarSentencia({ sql, binds }) {
		return new Promise(async (resolve, reject) => {
			const _inicio = Date.now();
			try {
				const connection = await SnowFlake.#getConnection();

				connection.execute({
					sqlText: sql,
					binds: binds || [],
					complete: (error, stmt, rows) => {
						const _fin = Date.now();
						if (error) {
							log(`Error - ${_fin - _inicio}ms - ${sql} - ${error.message}`);
							reject(error);
						} else {
							log(`Completada - ${_fin - _inicio}ms - ${sql}`);
							resolve(rows);
						}
					},
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	static async generarNombreFicheroTemporal() {
		return new Promise((resolve) => {
			crypto.randomBytes(12, function (error, buffer) {
				resolve(`${buffer.toString("hex")}`);
			});
		});
	}

	static #sfFileFormat( tipoDatos ) {
		switch(tipoDatos) {
			case 'json' :
				return `FILE_FORMAT = ( TYPE = JSON STRIP_OUTER_ARRAY = TRUE )`
			case 'csv':
				return `FILE_FORMAT = ( TYPE = CSV FIELD_DELIMITER  = ';' SKIP_HEADER = 1 FIELD_OPTIONALLY_ENCLOSED_BY = '"')`
		}
	}

	static #sfCopyParams( tipoDatos ) {
		switch(tipoDatos) {
			case 'json' :
				return `MATCH_BY_COLUMN_NAME = 'CASE_INSENSITIVE'`
			case 'csv':
				return ``
		}
	}

	static async cargar(database, schema, table, buffer, options = {}) {
		let { tipoDatos } = options;
		let tabla = `${database}.${schema}.${table}`;
		let nombreTemporal = await SnowFlake.generarNombreFicheroTemporal();
		let stage = `${database}.${schema}.${tipoDatos}_stage_${nombreTemporal}`.toUpperCase();

		try {
			let resultado = {
				destino: {
					basedatos: database,
					esquema: schema,
					tabla: table,
				},
			};
			await writeFile(nombreTemporal, buffer);
			logger.trace(`Escribiendo buffer temporalmente en: ${nombreTemporal} (${buffer.length} bytes)`);

			logger.debug(
				await SnowFlake.ejecutarSentencia({
					sql: `CREATE TEMPORARY STAGE IF NOT EXISTS ${stage} ${SnowFlake.#sfFileFormat(tipoDatos)}`,
				})
			);

			let _inicio = Date.now();
			let resultadoCarga = await SnowFlake.ejecutarSentencia({
				sql: `PUT file://${nombreTemporal} @${stage} AUTO_COMPRESS = TRUE OVERWRITE = TRUE`,
			});
			logger.trace("Resultado de carga del fichero:");
			logger.trace(resultadoCarga[0]);

			resultado = {
				...resultado,
				transferencia: {
					bytes: resultadoCarga[0].sourceSize,
					estadoTransferencia: resultadoCarga[0].status,
					milisegundos: Date.now() - _inicio,
				},
			};

			_inicio = Date.now();
			let resultadoCopia = await SnowFlake.ejecutarSentencia({
				sql: `COPY INTO ${tabla} FROM @${stage}/${nombreTemporal} ${SnowFlake.#sfFileFormat(tipoDatos)} ${SnowFlake.#sfCopyParams(tipoDatos)} PURGE = TRUE ON_ERROR = 'CONTINUE'`,
			});
			logger.trace("Resultado de carga en tabla:");
			logger.trace(resultadoCopia[0]);

			resultado = {
				...resultado,
				estado: resultadoCopia[0].status,
				lineasAnalizadas: resultadoCopia[0].rows_parsed,
				lineasCargadas: resultadoCopia[0].rows_loaded,
				milisegundos: Date.now() - _inicio,
			};

			if (resultadoCopia[0].errors_seen) {
				resultado = {
					...resultado,
					limiteErrores: resultadoCopia[0].error_limit,
					numeroErrores: resultadoCopia[0].errors_seen,
					error: resultadoCopia[0].first_error,
					lineaError: resultadoCopia[0].first_error_line,
					caracterError: resultadoCopia[0].first_error_character,
					nombreColumnaError: resultadoCopia[0].first_error_column_name,
				};
			}

			return resultado;
		} catch (error) {
			if (error.code === 407002 && !options.noReintentar) {
				log("La sesión ha sido cerrada por el servidor");
				await SnowFlake.#resetConnection();
				return SnowFlake.cargar(database, schema, table, buffer, { ...options, noReintentar: true });
			}
			throw error;
		} finally {
			logger.trace("Realizando limpieza");
			unlink(nombreTemporal).catch((e) => logger.warn(e.message));
			SnowFlake.ejecutarSentencia({ sql: `DROP STAGE IF EXISTS ${stage}` }).catch((e) => {});
		}
	}
}
export default SnowFlake;
