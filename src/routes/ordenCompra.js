const Router = require("koa-router");
const axios = require("axios");

const router = new Router();

// gets token
router.get("/orden", async (ctx) => {
    try {
      const headers = {
        "Content-Type": "application/json", // Adjust the content type if necessary
      };
      const response = await axios.post(
        "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/auth",
        { group: 5, secret: "J6RyeTrwNgX.Z+*MKh4EaBuLn" },
        {
          headers,
        }
      ); // Replace with the API endpoint URL
      ctx.body = response.data.token;
      const token = response.data.token;
      console.log(response.data);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

module.exports = router;