const getToken = require("./getToken");
const axios = require("axios");
const poblar = require("../ordenes_creadas.js")

async function newOrder(requestBody) {
    try {
        const token = await getToken();
        const headers = {
            "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
            Authorization: "Bearer " + token,
        };
        const response = await axios.post(
            `https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes`,
            requestBody,
            { headers }
        );

        console.log(response.data);
        if (response.status === 201) {
            console.log("ORDEN CREADA");
            poblar(response.data.id, "creada", requestBody.sku, requestBody.cantidad, requestBody.proveedor)
            return response.data;
        }
    } catch (error) {
		console.log("error en newOrder")
        console.log(error.request.data);
    }
};

module.exports = newOrder;