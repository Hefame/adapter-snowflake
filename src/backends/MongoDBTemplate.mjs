import { MongoClient, ObjectId } from "mongodb";
import logger from "../utils/logger.mjs";
import HError from "../model/HError.mjs";

const DEFAULT_COLLECTION_OPTIONS = { writeConcern: { w: 1, wtimeout: 1000 } };
/**
 * El nombre se utiliza para determinar de manera estandar el nombre de las variables de entorno
 * esperadas.
 */
const NOMBRE = "TEMPLATE";

const getEntorno = (nombreVariable) => {
	return process.env[`MONGODB_${NOMBRE}_${nombreVariable}`];
};

const log = logger.generarSubnivel("mongodb", NOMBRE.toLowerCase());

class MongoDBTemplate {
	static ObjectId = ObjectId;
	static #connection;
	static #database;
	static #collections = {};

	static async getBD() {
		if (!MongoDBTemplate.#connection || !MongoDBTemplate.#database) {
			const MONGO_CONF = {
				url: getEntorno("URL"),
				database: getEntorno("DB"),
				connectionOptions: {
					connectTimeoutMS: 5000,
					serverSelectionTimeoutMS: 5000,
					useUnifiedTopology: true,
					appname: process.MICRONAME,
					// loggerLevel: "warn",
				},
			};

			const client = new MongoClient(MONGO_CONF.url, MONGO_CONF.connectionOptions);
			MongoDBTemplate.#connection = await client.connect();
			MongoDBTemplate.#database = MongoDBTemplate.#connection.db(MONGO_CONF.database);

			const logUrl = new URL(MONGO_CONF.url);
			logUrl.password = "****";
			log(`Conexión establecida con la base de datos ${logUrl}`);
		}
		return MongoDBTemplate.#database;
	}

	static async getColeccion(collectionName) {
		if (!MongoDBTemplate.#collections[collectionName]) {
			log(`Obteniendo colección ${collectionName}`);
			const COLLECTION_CONF = DEFAULT_COLLECTION_OPTIONS;
			const db = await MongoDBTemplate.getBD();
			MongoDBTemplate.#collections[collectionName] = db.collection(collectionName, COLLECTION_CONF);
			log(`Colección ${collectionName} instanciada`);
		}
		return MongoDBTemplate.#collections[collectionName];
	}

	static oid(value) {
		if (value) return new ObjectId(value);
		return new ObjectId();
	}

	static async consultaMongo() {
		const _inicio = Date.now();

		try {
			const coleccion = await MongoDBTemplate.getColeccion("test");
			let datos = await coleccion.findOne({});
			const _fin = Date.now();
			log(`consultaMongo - ${_fin - _inicio}ms - ${datos.length ?? 1} registros`);
			return datos;
		} catch (error) {
			const _fin = Date.now();
			log(`consultaMongo - ${_fin - _inicio}ms - Error: ${error.message} `);
			throw HError.from(error);
		}
	}
}
export default MongoDBTemplate;
