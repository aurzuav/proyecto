const axios = require('axios');
const getToken = require('./getToken')

const obtenerOrden = async (idOrden) => {
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
			Authorization: "Bearer " + token,
		};
		const response = await axios.get(
			`https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
			{
				headers,
			}
		);
		return (response.data);

		// if (response.status === 201) {
		// 	notificarActualizacion(response.data, 5)
		// }
	} catch (error) {
		console.log(error.response.data);
	}
};
module.exports = obtenerOrden