import supertest from "supertest";

const request = supertest("http://localhost:3000");

describe("POST /template", function () {
	it('Ejemplo de test unitario', function (done) {
		request
			.post("/template")
			.send({ prueba: true, random: 22 })
			.expect((res) => {
				if (!(res.body.body.prueba === true)) throw new Error("No se ha devuelto el campo {body: {prueba: true}}");
				if (!("stock" in res.body)) throw new Error("No se ha devuelto el campo 'stock'");
			})
			.expect(200)
			.end(done);
	});
});