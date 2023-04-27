import supertest from "supertest";
import { readFileSync } from "node:fs";

const request = supertest("http://localhost:3000");

const datosEjemplo = readFileSync("./test/sampledata.json");

describe("POST /carga", function () {
	this.timeout(30000); 
	it("Ejemplo de carga JSON", function (done) {
		request
			.post("/carga")
			.timeout(30000)
			.set({
				"x-database": "HEFAME_PRO",
				"x-schema": "SH_STAGING",
				"x-table": "TB_STG_CATALOGOS",
				"content-type": "application/json",
			})
			.send(datosEjemplo.toString('utf-8'))
			.expect((res) => {
				console.log(res.body)
				if (!(res.body.estado === 'LOADED')) throw new Error("No se ha cargado el fichero");
			})
			.expect(200)
			.end(done);
	});
});
