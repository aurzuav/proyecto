const axios = require("axios");


async function getStock(sku, group) {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        // first we get stores
        const inventoryResponse = await axios.get(
            `http://lagarto${group}.ing.puc.cl/stocks`,
            {
                headers,
            }
        );
        //console.log(storesResponse.data);
        for (const inventory of inventoryResponse.data) {
            //console.log("entro inventario");
            //console.log(inventory);
            if (inventory.sku === sku) {
                return 1;
            } 
        }
        return 0;
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = getStock;


