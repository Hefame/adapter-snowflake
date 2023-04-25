import amqp from "amqplib";
import logger from "../utils/logger.mjs";

/**
 * El nombre se utiliza para determinar de manera estandar el nombre de las variables de entorno
 * esperadas.
 */
const NOMBRE = "TEMPLATE";

const getEntorno = (nombreVariable) => {
	return process.env[`RABBIT_${NOMBRE}_${nombreVariable}`];
};

const log = logger.generarSubnivel("rabbit", NOMBRE.toLowerCase());

class RabbitTemplate {
	static conexion;
	static canales = {};
	static suscripciones = [];

	static async #getConexion() {
		if (!RabbitTemplate.conexion) {
			RabbitTemplate.conexion = await amqp.connect(getEntorno("URL"));
			RabbitTemplate.conexion.on("error", (error) => {
				log(`Ha sucedido un error en la conexión Rabbit: ${error.message}`);
				RabbitTemplate.conexion = null;
				RabbitTemplate.canales = {};
			});

			RabbitTemplate.suscripciones.forEach((suscripcion) => {
				RabbitTemplate.suscribir(suscripcion.exchange, suscripcion.topic, suscripcion.callback);
			});
		}
		return RabbitTemplate.conexion;
	}

	static async #getCanal(exchange) {
		if (!RabbitTemplate.canales[exchange]) {
			let conexion = await RabbitTemplate.#getConexion();
			RabbitTemplate.canales[exchange] = await conexion.createChannel();
			RabbitTemplate.canales[exchange].assertExchange(exchange, "topic", { durable: false });
		}
		return RabbitTemplate.canales[exchange];
	}

	static async suscribir(exchange, topic, callback) {
		let canal = await RabbitTemplate.#getCanal(exchange);
		let cola = await canal.assertQueue("", { exclusive: true });
		canal.bindQueue(cola.queue, exchange, topic);

		log(`Suscrito a: ${exchange} - ${topic}`);
		canal.consume(
			cola.queue,
			(msg) => {
				if (msg !== null) {
					log(`${exchange} - ${topic} - Payload recibido: ${msg.fields?.routingKey}`);
					callback(msg);
				} else {
					log(`${exchange} - ${topic} - Se ha desconectado de la cola`);
					callback(msg);
				}
			},
			{
				noAck: true,
			}
		);

		let registroSuscripcion = RabbitTemplate.suscripciones.find((s) => s.exchange === exchange && s.topic === topic);
		if (!registroSuscripcion) {
			log(`Añadido al registro de suscripciones: ${exchange} - ${topic}`);
			RabbitTemplate.suscripciones.push({ exchange, topic, callback });
		}
	}

	static async publicar(exchange, topic, buffer) {
		let canal = await RabbitTemplate.#getCanal(exchange);
		await canal.publish(exchange, topic, buffer);
		log(`${exchange} - ${topic} - Publicado mensaje (${buffer.length} bytes)`);
	}
}

export default RabbitTemplate;
