const IdAlmacenes = require("./IdAlmacenes");
const getToken = require("./getTokenW");
const axios = require("axios");

async function moveProduct(sku, cantidad) {
  try {
    const almacenes = await IdAlmacenes()
    console.log("Almacenes:", almacenes);
    let keyKitchen;
    almacenes.forEach(almacen => {
      const key = Object.keys(almacen)[0];
      const value = almacen[key];

      if (value === 'kitchen') {
        keyKitchen = key;
        return; // Terminar el bucle si se encuentra la clave "kitchen"
      }
    });
    outerLoop: // Etiqueta para el bucle externo
    for (const almacen of almacenes) {
      const idStore = Object.keys(almacen)[0];
      if ((almacen[idStore] == "almacenCheckIn") || (almacen[idStore] == "buffer")){
      console.log(`consulta a almacen ${almacen[idStore]} con id: ${idStore} por el sku ${sku}`)
      const token = await getToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + `${token}`,
      };
      const stockResponse = await axios.get(
        `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${idStore}/products?sku=${sku}`,
        {
          headers,
        }
      );
      //console.log(stockResponse.data)
      if ((stockResponse.data.length >= cantidad) && (idStore !== keyKitchen)) {
        console.log(`${JSON.stringify(almacen)} tiene stock suficiente de ${sku}`)
        const listaIds = stockResponse.data.map(objeto => objeto._id);
        let contador = 0
        requestBody = { store: `${keyKitchen}` }
        while (contador < cantidad) {
          id = listaIds[contador]
          const token = await getToken();
          const headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + `${token}`,
          };
          const moveResponse = await axios.patch(
            `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products/${id}`,

            requestBody,
            { headers }

          )
          console.log("lo movi")
          console.log(moveResponse.data)
          contador += 1
        }
        break outerLoop; // Salir del bucle externo
      } 
    }
  } }catch (error) {
    if (error.isAxiosError) {
      const errorArray = error.response.data; // Accede al array de errores
      console.log(errorArray); // Imprime el array de errores
    }
  }
}

module.exports = moveProduct;

