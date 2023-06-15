const axios = require("axios");
const getTokenW = require("./getTokenW")


async function getStockRecepcion(sku) {
    try{
    const token = await getTokenW();
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      };
      
      const storesResponse = await axios.get(
        "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
        { headers }
      );
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

      const headers_ = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      };
      
      const storesResponse_ = await axios.get(
        `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${receptionId}/products?sku=${sku}`,
        { headers }
      );
      return storesResponse_.data.length
     
    } catch (error) {
        console.log(error.message);
        return 0
    }
}

module.exports = getStockRecepcion;



