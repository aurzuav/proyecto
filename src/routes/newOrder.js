const getToken = require("./ordenCompra");
const axios = require("axios");


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
            return response.data;
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = newOrder;