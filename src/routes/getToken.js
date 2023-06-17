
const axios = require("axios");

let token = null;

async function getToken() {
	try {
		const headers = {
			"Content-Type": "application/json",
		};
		const response = await axios.post(
			"https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/autenticar",
			//{ group: 5, secret: "J6RyeTrwNgX.Z+*MKh4EaBuLn" },
			{ group: 5, secret: "p=HjsR<8qUDZ9kSEdv" },
			{ headers }
		);
		return response.data.token;
	} catch (error) {
		console.error(error);
	}
}



module.exports = getToken;
