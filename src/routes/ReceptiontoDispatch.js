const actualizarOrden = require("./actualizarOrden.js");
const getToken = require("./getToken.js");
const getTokenW = require("./getTokenW.js")
const axios = require("axios");
const notifyOrder = require("./notifyOrder.js");
const IdAlmacenes = require("./IdAlmacenes.js");



async function ReceptionToDispatch(idOrden, qty, sku) {
  try {
    console.log(`voy a despachar la orden ${idOrden}`)
    const almacenes = await IdAlmacenes()
    let keyCheckIn;
    almacenes.forEach(almacen => {
        const key = Object.keys(almacen)[0];
        const value = almacen[key];

        if (value === 'almacenCheckIn') {
            keyCheckIn = key;
            return; // Terminar el bucle si se encuentra la clave ""
        }
    });
    let keyCheckOut;
    almacenes.forEach(almacen => {
        const key = Object.keys(almacen)[0];
        const value = almacen[key];

        if (value === 'almacenCheckOut') {
            keyCheckOut = key;
            return; // Terminar el bucle si se encuentra la clave ""
        }
    });
    const token = await getTokenW();
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
      Authorization: "Bearer " + token,
    };
    const stockResponse = await axios.get(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${keyCheckIn}/products?sku=${sku}`,
      { headers }
    );
    if (stockResponse.data.length >= qty){
      const listaIds = stockResponse.data.map(objeto => objeto._id);
      let contador = 0
      while (contador < qty){
        const moveResponse = await axios.patch(
          `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products/${listaIds[contador]}`,
          { "store": `${keyCheckOut}` },
          { headers }
        )
        console.log(moveResponse.data)
        const dispatchResponse = await axios.post(
          "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/dispatch",
          { "productId": `${listaIds[contador]}`, "orderId": `${idOrden}` },
          { headers }
        ); 
        console.log(dispatchResponse.data)
        contador += 1
      }
    }
    console.log(`Orden: ${idOrden} Despachada`);
    
  } catch (error) {
    if (error.isAxiosError) {
      const errorArray = error.response.data; // Accede al array de errores
      console.log(errorArray); // Imprime el array de errores
  }
  }
}
  
module.exports = ReceptionToDispatch