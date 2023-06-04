const actualizarOrden = require("./actualizarOrden.js");
const getToken = require("./getToken.js");
const getTokenW = require("./getTokenW.js")
const axios = require("axios");
const notifyOrder = require("./notifyOrder.js")


async function ReceptionToDispatch(idOrden, canal, qty) {
  try {
    console.log("qty")
    console.log(qty)
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
      Authorization: "Bearer " + token,
    };
    
    const response = await axios.get(
      `https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
      { headers }
    );
    
    console.log(response.data);
    const sku = response.data.sku
    
    for (let i = 0; i < qty; i++) {
      try {
        const token = await getTokenW();
        const headers = {
          "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
          Authorization: "Bearer " + token,
        };
        
        const productId = await getProductId(sku);
        console.log("productId")
        console.log(productId)
        
        const response = await axios.post(
          "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/dispatch",
          { "productId": `${productId}`, "orderId": `${idOrden}` },
          { headers }
        ); 
        console.log(response.data);
      } catch (error) {
        console.log(error.response.data);
      }
    }
    console.log("se reception to dipatch listo");
    
    // Ahora notificamos al grupo
    //requestBody = {"estado":"finalizada"}
    //await actualizarOrden(requestBody)

    //await notifyOrder("finalizada", cliente, idOrden);
    
  } catch (error) {
    console.log(error);
  }
}
async function getProductId(sku) {
    try {
      //TOKEN
      const token = await getTokenW();
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      };
      
      const storesResponse = await axios.get(
        "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
        { headers }
      );
      
      //OBTENER ID DE BODEGA, BODEGA BUFFER Y BODEGA KITCHEN
      const inventoryDict = {};
      let receptionId = "";
      let kitchenId = "";
      
      
      const stores = storesResponse.data;
      stores.forEach((element) => {
        if (element.buffer === true) {
          inventoryDict[element._id] = "Bodega Buffer";
        } else if (element.kitchen === true) {
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
        { headers }
      );
      
      //INGREDIENTES EN EL INVENTARIO DE RECEPCION
      console.log("sku")
      console.log(sku)
      //console.log(stockResponse.data)
      for (const ingrediente of stockResponse.data) {
        // VER SI INGREDIENTE ESTA EN EL INVENTARIO
        console.log(ingrediente)
        if (ingrediente.sku === sku) {
            console.log("dentro del if")
          //OBTENER DETALLE DE INGREDIENTE, PARA OBTENER ID
          const detalleIngrediente = await axios.get(
            `https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${receptionId}/products?sku=${sku}`,
            { headers }
          );
          //ElIJO EL PRIMER ID QUE APARECE (lo elegi de manera random, podría ser cualquierA)
          const productoId = detalleIngrediente.data[0]._id;
          return productoId;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  
module.exports = ReceptionToDispatch