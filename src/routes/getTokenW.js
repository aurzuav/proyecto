const axios = require("axios");

let token = null;

async function fetchToken() {
	try {
		const headers = {
			"Content-Type": "application/json",
		};
    const response = await axios.post(
      "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/auth",
       //{ group: 5, secret: "J6RyeTrwNgX.Z+*MKh4EaBuLn" },
      { group: 5, secret: "p=HjsR<8qUDZ9kSEdv" },
      { headers }
    );
		return response.data.token;
	} catch (error) {
		console.error(error);
	}
}

async function getToken() {
	// Si el token no está definido o ha expirado, obtén uno nuevo
	if (!token) {
		token = await fetchToken();
	}

	// Programar actualización del token cada 25 minutos
	setInterval(async () => {
		token = await fetchToken();
	}, 25 * 60 * 1000);

	return token;
}

module.exports = getToken;