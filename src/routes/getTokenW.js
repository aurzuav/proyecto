const axios = require("axios");

async function getToken() {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const response = await axios.post(
        "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/auth",
        { group: 5, secret: "J6RyeTrwNgX.Z+*MKh4EaBuLn" },
        { headers }
      );
      return response.data.token;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

module.exports = getToken