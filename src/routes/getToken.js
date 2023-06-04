const axios = require("axios");


// Esta es una funcion para obtener el token, la usamos para hacer los llamados a la API (necesitan el token como autorizacion)
async function getToken() {
	try {
		const headers = {
			"Content-Type": "application/json",
		};
		const response = await axios.post(
			"https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/autenticar",
			{ group: 5, secret: "J6RyeTrwNgX.Z+*MKh4EaBuLn" },
			{
				headers,
			}
		);
		return response.data.token;
	} catch (error) {
		console.error(error);
		return null;
	}
}
module.exports = getToken