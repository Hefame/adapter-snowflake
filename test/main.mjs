import supertest from "supertest";
import { readFileSync } from "node:fs";

const request = supertest("http://localhost:3000");

const datosEjemploJson = readFileSync("./test/sampledata.json");
const datosEjemploCsv = readFileSync("./test/sampledata.csv");
const datosEjemploCsv2 = readFileSync("./test/sampledata.farmacias.csv");

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
			.send(datosEjemploJson.toString('utf-8'))
			.expect((res) => {
				console.log(res.body)
				if (!(res.body.estado === 'LOADED')) throw new Error("No se ha cargado el fichero");
			})
			.expect(200)
			.end(done);
	});
	it("Ejemplo de carga CSV", function (done) {
		request
			.post("/carga")
			.timeout(30000)
			.set({
				"x-database": "HEFAME_PRO",
				"x-schema": "SH_STAGING",
				"x-table": "TB_STG_FARMACIAS_TAM",
				"content-type": "text/csv",
			})
			.send(datosEjemploCsv.toString('utf-8'))
			.expect((res) => {
				console.log(res.body)
				if (!(res.body.estado === 'LOADED')) throw new Error("No se ha cargado el fichero");
			})
			.expect(200)
			.end(done);
	});
	it("Ejemplo de carga CSV Farmacias", function (done) {
		request
			.post("/carga")
			.timeout(30000)
			.set({
				"x-database": "HEFAME_PRO",
				"x-schema": "SH_STAGING",
				"x-table": "TB_STG_FARMACIAS",
				"content-type": "text/csv",
			})
			.send(datosEjemploCsv2.toString('utf-8'))
			.expect((res) => {
				console.log(res.body)
				if (!(res.body.estado === 'LOADED')) throw new Error("No se ha cargado el fichero");
			})
			.expect(200)
			.end(done);
	});
	
});
