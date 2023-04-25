import logger from "../utils/logger.mjs";

// https://github.com/snowflakedb/snowflake-connector-nodejs/issues/365
import error_aws_v3 from "aws-sdk/lib/maintenance_mode_message.js";
error_aws_v3.suppress = true;
//

import snowflake from "snowflake-sdk";

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

	static async ejecutarSentencia({ sql, variables }) {
		return new Promise(async (resolve, reject) => {
			const connection = await SnowFlake.#getConnection();
			connection.execute({
				sqlText: sql,
				binds: variables,
				complete: (error, stmt, rows) => {
					if (error) {
						log(`La ejecución falló: ${error.message}`);
						reject(error);
					} else {
						resolve(rows);
					}
				},
			});
		});
	}
/*
	static async initializeTable(options) {
		const { recreate } = options;

		let sql = `
            CREATE ${recreate ? "OR REPLACE TABLE" : "TABLE IF NOT EXISTS"} "DB_HEFAME_EDWH_PRO"."CONSULTAS_STOCK"."FEDICOM2" (
              id BIGINT identity(1,1) not null,
              fecha BIGINT NOT NULL,
              cliente VARCHAR(10) NOT NULL,
              material VARCHAR(18) NOT NULL,
              centroHabitual VARCHAR(4),
              centroSuministro VARCHAR(4),
              motivoFalta VARCHAR(40),
              limiteLab BOOLEAN,
              pva INT,
              pvp INT,
              iva TINYINT,
              almacenes VARCHAR(20)
            );
          `;

		await SnowFlake.#executeStmt({ query: sql, binds: [] });
	}

	static async insert(payloads) {
		if (!Array.isArray(payloads)) {
			payloads = [payloads];
		}

		let i = 1;
		let valueList = [];
		let stringList = [];

		payloads.forEach((payload) => {
			stringList.push(`(:${i++},:${i++},:${i++},:${i++},:${i++},:${i++},:${i++},:${i++},:${i++},:${i++},:${i++})`);

			valueList.push(payload.query.fecha.getTime());
			valueList.push(payload.query.cliente);
			valueList.push(payload.result.codigoArticulo || "000000");
			valueList.push(payload.result.centroHabitual);
			valueList.push(payload.result.centroSuministro);
			valueList.push(payload.result.motivoFalta || null);
			valueList.push(Boolean(payload.result.limitadoLaboratorio));
			valueList.push(parseInt(payload.result.pva * 100) || 0);
			valueList.push(parseInt(payload.result.pvp * 100) || 0);
			valueList.push(parseInt(payload.result.iva) || 0);
			valueList.push(payload.result.almacenes.join(","));
		});

		const query = `INSERT INTO "DB_HEFAME_EDWH_PRO"."CONSULTAS_STOCK"."FEDICOM2" (fecha, cliente, material, centroHabitual, centroSuministro, motivoFalta, limiteLab, pva, pvp, iva, almacenes) VALUES ${stringList.join(
			", "
		)}`;
		const queryValues = valueList;

		const result = await SnowFlake.#executeStmt({
			query,
			binds: queryValues,
		});

		return result;
	}
    */
}
export default SnowFlake;
