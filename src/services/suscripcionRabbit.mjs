import RabbitTemplate from "../backends/RabbitTemplate.mjs";
import logger from "../utils/logger.mjs";

const suscripcionRabbit = async () => {
	await RabbitTemplate.suscribir("test", "test.#", (msg) => {
		let mensaje = JSON.parse(msg.content.toString());
		logger.info("Consumido: " + mensaje);
	});
};

export default suscripcionRabbit;
