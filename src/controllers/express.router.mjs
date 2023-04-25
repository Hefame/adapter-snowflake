import template from "./template/index.mjs";

const expressRouter = (app) => {
	app.use("/template", template);
};

export default expressRouter;
