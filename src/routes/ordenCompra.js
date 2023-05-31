const Router = require("koa-router");
const axios = require("axios");
const router = new Router();
const fs = require("fs");
const csv = require("csv-parser");

// Se usa el excel de la E2
const Productdictionary = {};
const Formuladictionary = {}; // Declara la variable dictionary fuera de la función

async function getCSVDictionary(dictionary, filePath) {
  console.log("get CSV file...");

  try {
    await readCSVFile(filePath, dictionary); // Espera a que se complete la lectura del archivo y se llene el diccionario
    //console.log(dictionary); // Ahora puedes usar dictionary fuera de la función
    // Continúa con el resto del código que depende del diccionario
  } catch (error) {
    console.error(error);
  }
}

function readCSVFile(filePath, dictionary) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const keys = Object.keys(row);
        const key = row[keys[0]];

        const values = keys.slice(1).map((column) => row[column]);

        dictionary[key] = values;
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Llama a la función getCSVDictionary para comenzar la carga del diccionario
getCSVDictionary(Productdictionary, "./products_E2.csv");
getCSVDictionary(Formuladictionary, "./formulas_E2.csv");



// gets token
router.get("/orden", async (ctx) => {
    try {
      const headers = {
        "Content-Type": "application/json", // Adjust the content type if necessary
      };
      const response = await axios.post(
        "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/autenticar",
        { group: 5, secret: "p=HjsR<8qUDZ9kSEdv" },
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

  // Esta es una funcion para obtener el token, la usamos para hacer los llamados a la API (necesitan el token como autorizacion)
async function getToken() {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await axios.post(
        "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/autenticar",
        { group: 5, secret: "p=HjsR<8qUDZ9kSEdv" },
        {
          headers,
        }
    );
    return response.data.token;
  } catch (error) {
    console.error(error);
    return null;
  }
}

  //obtener orden de compra
  router.get("/obtener-orden", async (ctx) => {
    try {
        const token = await getToken();
        const headers = {
            "Content-Type": "application/json", // Adjust the content type if necessary
            Authorization: "Bearer " + token,
          };
          const idOrden = "6470ffd12abc3cdd7509ff9d"
          const response = await axios.get(
            `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
            {
              headers,
            })
            ctx.body = response.data;
    }
     catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

async function producir_orden(idOrden){
    //obtener orden

    try {
        const token = await getToken();
        const headers = {
            "Content-Type": "application/json", // Adjust the content type if necessary
            Authorization: "Bearer " + token,
          };
          const response = await axios.get(
            `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
            {headers})
        sku = response.data.sku
        //console.log(sku)
        const producto = Productdictionary[sku];
        // si es una hamburguesa debiera tener una formula que esta en Formulasdictionary
        //console.log(producto)
    }
        catch (error) {
        console.log(error)
    }
}

producir_orden("6470ffd12abc3cdd7509ff9d")

module.exports = router;