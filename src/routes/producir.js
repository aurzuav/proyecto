const getToken = require("./getTokenW");
const axios = require("axios");



async function producirSku(sku, quantity){
        try {
          console.log(`voy a producir ${sku} con cantidad: ${quantity}`)
            const token = await getToken();
            const headers = {
                "Content-Type": "application/json", // Adjust the content type if necessary
                Authorization: "Bearer " + token,
              };
            const response = await axios.post(
                "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products ",
                { sku: `${sku}`, quantity: `${quantity}` },
                {
                  headers,
                }
              ); // Replace with the API endpoint URL
              console.log(response.data);
        } catch (error) {
          if (error.isAxiosError) {
            const errorArray = error.response.data; // Accede al array de errores
            console.log(errorArray); // Imprime el array de errores
          }
        }
}

module.exports = producirSku;
