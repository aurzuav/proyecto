const Router = require('koa-router');
const axios = require("axios");

module.exports = function ({getToken}){
    const router = new Router();
    router.get('/producir', async (ctx) => {
        try {
            const token = await getToken();
            const headers = {
                "Content-Type": "application/json", // Adjust the content type if necessary
                Authorization: "Bearer " + token,
              };
            const sku = "cd4b7aab6f"
            const quantity = 4 
            const response = await axios.post(
                "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl//warehouse/products ",
                { sku: `${sku}`, quantity: `${quantity}` },
                {
                  headers,
                }
              ); // Replace with the API endpoint URL
            ctx.body = response.data;
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: error.message };
        }
    })
    return router;
};



