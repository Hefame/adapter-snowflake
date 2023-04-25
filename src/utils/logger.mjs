import winston from "winston";
import "winston-daily-rotate-file";
import expressWinston from "express-winston";

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
export const levels = {
	fatal: 0,
	error: 1,
	warn: 2,
	info: 3,
	http: 4,
	debug: 5,
	mongodb: 6,
	mariadb: 6,
	rabbit: 6,
	axios: 6,
	sched: 6,
	snowflake: 6,
	all: 1000,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
export const level = () => {
	const env = process.env.NODE_ENV || "development";
	const isDevelopment = env === "development";
	return isDevelopment ? "all" : "warn";
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
export const colorize = process.env.NODE_ENV !== "production";
export const colors = {
	fatal: "white redBG",
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "italic blue",
	mongodb: "italic white",
	mariadb: "italic white",
	rabbit: "italic white",
	sched: "italic white",
	snowflake: "italic white",
	axios: "italic white",
};

winston.addColors(colors);

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
export const transports = [
	// Allow the use the console to print the messages
	new winston.transports.Console({
		handleExceptions: true,
		format: winston.format.combine(
			winston.format.errors({ stack: true }),
			winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
			colorize ? winston.format.colorize({ all: true }) : winston.format.uncolorize(),
			winston.format.printf(
				(info) =>
					`${info.timestamp} ${info.level}\t${info.label ? `[${info.label}] ` : ""}${info.message}${
						info.stack ? "\r\n" + info.stack : ""
					}`
			)
		),
	}),
];

if (process.env.LOG_DESTINATION_DIR) {
	transports.push(
		new winston.transports.DailyRotateFile({
			dirname: process.env.LOG_DESTINATION_DIR,
			filename: process.env.LOG_DESTINATION_FILENAME || `${process.MICRONAME}-%DATE%.log`,
			format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
			datePattern: process.env.LOG_DESTINATION_DATE_PATTERN || "YYYY-MM-DD",
			zippedArchive: true,
			maxSize: process.env.LOG_DESTINATION_MAX_SIZE || "10mb",
			maxFiles: process.env.LOG_DESTINATION_MAX_AGE || "7d",
		})
	);
}

// Create the logger instance that has to be exported
// and used to log messages.
const logger = winston.createLogger({
	level: level(),
	levels,
	transports,
});

logger.generarSubnivel = (nivel, subnivel) => {
	return (message) => {
		logger.log({
			level: nivel,
			label: subnivel,
			message,
		});
	};
};

export const winstonMiddleware = expressWinston.logger({
	transports,
	level: "http",
	meta: true, // optional: control whether you want to log the meta data about the request (default to true)
	expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
	colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
	ignoreRoute: (req, res) => {
		return req.url === "/health";
	},
	requestFilter: (req, propName) => {
		if (propName === "headers") {
			return Object.keys(req.headers).reduce(function (filteredHeaders, key) {
				if (key === "authorization") {
					filteredHeaders[key] = `*** (${req.headers[key].length} bytes) ***`;
				} else {
					filteredHeaders[key] = req.headers[key];
				}
				return filteredHeaders;
			}, {});
		} else {
			return req[propName];
		}
	},
});

export default logger;
