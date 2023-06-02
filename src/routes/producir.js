const getToken = require("../app");
const axios = require("axios");

async function producirSku(sku, quantity){
        try {
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
              console.log(response.data)
        } catch (error) {
          console.log(error.response.data)
        }

      }
    ); // Replace with the API endpoint URL
    //console.log(response.data)
  } catch (error) {
    console.log(error.response.data);
  }
}

module.exports = producirSku;
