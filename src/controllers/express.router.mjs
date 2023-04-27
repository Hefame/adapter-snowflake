import carga from "./carga/index.mjs";

const expressRouter = (app) => {
	app.use("/carga", carga);
};

export default expressRouter;
