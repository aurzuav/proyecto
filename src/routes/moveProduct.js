const getToken = require("./getTokenW");
const axios = require("axios");

async function moveProduct(sku) {
  try {
    //TOKEN
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + `${token}`,
    };
    const storesResponse = await axios.get(
      "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
      {
        headers,
      }
    );

    //OBTENER ID DE BODEGA, BODEGA BUFFER Y BODEGA KITCHEN
    const inventoryDict = {};
    const stores = storesResponse.data;
    stores.forEach((element) => {
      if (element.buffer == true) {
        inventoryDict[element._id] = "Bodega Buffer";
      } else if (element.kitchen == true) {
        inventoryDict[element._id] = "Bodega Kitchen";
        kitchenId = element._id;
      } else {
        inventoryDict[element._id] = "Bodega";
        receptionId = element._id;
      }
    });
    // INVENTARIO DE BODEGA (RECEPCION)
    const stockResponse = await axios.get(
      `https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${receptionId}/inventory`,
      {
        headers,
      }
    );

    //INGREDIENTES EN EL INVENTARIO DE RECEPCION
    for (const ingrediente of stockResponse.data) {
      // VER SI INGREDIENTE ESTA EN EL INVENTARIO
      if (ingrediente.sku == sku) {
        //OBTENER DETALLE DE INGREDIENTE, PARA OBTENER ID
        const detalleIngrediente = await axios.get(
          `https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${receptionId}/products?sku=${sku}`,
          {
            headers,
          }
        );
        //ElIJO EL PRIMER ID QUE APARECE (lo elegi de manera random, podría ser cualquierA)
        productoId = detalleIngrediente.data[0]._id;
        //SI INGREDIENTE ESTA EN EL INVENTARIO, CAMBIAR A BODEGA KITCHEN
        const move = await axios.patch(
          `https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products/${productoId}`,
          { store: `${kitchenId}` },
          { headers }
        );
        console.log("define");
        console.log("MOVE", move.data);
      } else {
        //console.log("NO HAY INGREDIENTE",sku);
      }
    }
  } catch (error) {
    console.log(error.response);
  }
}

module.exports = moveProduct;

