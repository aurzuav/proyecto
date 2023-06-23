const axios = require("axios");

let token = null;

async function fetchToken() {
	try {
		const headers = {
			"Content-Type": "application/json",
		};
		const response = await axios.post(
			"https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/autenticar",
			{ group: 5, secret: "p=HjsR<8qUDZ9kSEdv" },
			{ headers }
		);
			// Programar actualización del token cada 25 minutos
		setInterval(async () => {
			console.log("actualizando token")
			token = await fetchToken();
			}, 25 * 60 * 1000);
		return response.data.token;
	} catch (error) {
		console.error(error);
	}
}

async function getToken() {
	// Si el token no está definido o ha expirado, obtén uno nuevo
	if (!token) {
		console.log("token no estaba")
		token = await fetchToken();
	}
	return token;
}

module.exports = getToken;