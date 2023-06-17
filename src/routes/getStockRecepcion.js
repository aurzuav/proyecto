const axios = require("axios");
const getToken = require("./getTokenW");
const IdAlmacenes = require("./IdAlmacenes");


async function getStockRecepcion(sku) {
  try {
    const almacenes = await IdAlmacenes()
    let keyCheckIn;
    almacenes.forEach(almacen => {
        const key = Object.keys(almacen)[0];
        const value = almacen[key];

        if (value === 'almacenCheckIn') {
            keyCheckIn = key;
            return; // Terminar el bucle si se encuentra la clave "kitchen"
        }
    });
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };
    const stockResponse = await axios.get(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${keyCheckIn}/products?sku=${sku}`,
      { headers }
    );
    return stockResponse.data.length
  } catch (error) {
    console.log(error.message);
    return 0
  }
}

module.exports = getStockRecepcion;



