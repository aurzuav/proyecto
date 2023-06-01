const Router = require("koa-router");
const axios = require("axios");
const router = new Router();
const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");


// Se usa el excel de la E2
const Productdictionary = {};
const Formuladictionary = {}; // Declara la variable dictionary fuera de la función

// Esta función lee el archivo CSV y llena el diccionario FORMULA
async function getCSVDictionaryFormula(dictionary, filePath) {
  console.log("get CSV file...");
  try {
    await readCSVFileFormula(filePath, dictionary); // Espera a que se complete la lectura del archivo y se llene el diccionario
    //console.log(dictionary); // Ahora puedes usar dictionary fuera de la función
    // Continúa con el resto del código que depende del diccionario
  } catch (error) {
    console.error(error);
  }
}

// Esta función lee el archivo CSV y llena el diccionario PRODUCTS
async function getCSVDictionaryProducts(dictionary, filePath) {
  console.log("get CSV file...");
  try {
    await readCSVFileProducts(filePath, dictionary); // Espera a que se complete la lectura del archivo y se llene el diccionario
    //console.log(dictionary); // Ahora puedes usar dictionary fuera de la función
    // Continúa con el resto del código que depende del diccionario
  } catch (error) {
    console.error(error);
  }
}

function readCSVFileFormula(filePath, dictionary) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const keys = Object.keys(row);
        const burgerId = row[keys[0]].toString();
        const burgerName = row[keys[1]].toString();
        const ingredientId = row[keys[2]].toString();
        const ingredientName = row[keys[3]].toString();
        
        if (!dictionary[burgerId]) {
          dictionary[burgerId] = {
            nombre: burgerName,
            ingredientes: {} // Inicializa un nuevo objeto para los ingredientes de la hamburguesa
          };
        }
        
        if (!dictionary[burgerId].ingredientes[ingredientId]) {
          dictionary[burgerId].ingredientes[ingredientId] = ingredientName; // Agrega el ingrediente al diccionario de ingredientes de la hamburguesa si no existe aún
        }
        
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function readCSVFileProducts(filePath, dictionary) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const keys = Object.keys(row);
        const sku = row[keys[0]].toString();
        const name = row[keys[1]].toString();
        const description = row[keys[2]].toString()
        const productionCost = row[keys[3]].toString();
        const numberIngredients = row[keys[4]].toString();
        const expectedDuration = row[keys[5]].toString();
        const productionBatch = row[keys[6]].toString();
        const productionTime = row[keys[7]].toString();
        const productionGroups = row[keys[8]].toString();
        const totalGroups = row[keys[9]].toString();
        const production = row[keys[10]].toString();
        
        if (!dictionary[sku]) {
          dictionary[sku] = {
            nombre: name,
            descripcion: description,
            costoProduccion: productionCost,
            numeroIngredientes: numberIngredients,
            duracionEsperada: expectedDuration,
            loteProduccion: productionBatch,
            tiempoProduccion: productionTime,
            gruposProductores: productionGroups,
            totalGruposProductores: totalGroups,
            produccion: production
          };
        }
        

        
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
getCSVDictionaryProducts(Productdictionary, "./products_E2.csv");
getCSVDictionaryFormula(Formuladictionary, "./formulas_E2.csv");

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

//crear orden
const crearOrden = async (requestBody) => {
  try {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
      Authorization: "Bearer " + token,
    };
    const response = await axios.post(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes`,
      requestBody,
      {headers}
    );
    console.log(response.data);
    if (response.status === 201){
      notificarOrden(response.data)
    }
  } catch (error) {
    console.log(error.response.data);
  }
};


//obtener orden de compra
const obtenerOrden = async (idOrden) => {
  try {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
      Authorization: "Bearer " + token,
    };
    const response = await axios.get(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
      {
        headers,
      }
    );
    console.log(response.data);
    if (response.status === 201){
      notificarActualizacion(response.data)
    }
  } catch (error) {
    console.log(error.response.data);
  }
};

//crear orden
const actualizarOrden = async (requestBody, idOrden) => {
  try {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
      Authorization: "Bearer " + token,
    };
    const response = await axios.post(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/${idOrden}/estado`,
      requestBody,
      {headers}
    );
    console.log(response.data);
    return response.data
  } catch (error) {
    console.log(error.response.data);
  }
};

//notificar al grupo que la orden fue creada
const notificarOrden = async (data) => {
  try {
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
    };
    const requestBody = {
      "cliente": data.cliente,
      "sku": data.sku,
      "fechaEntrega": data.vencimiento,
      "cantidad": data.cantidad,
      "urlNotificacion": "nosequeesesto.cl"
   }
    const response = await axios.post(
      `http://lagarto5.ing.puc.cl/ordenes-compra/${data.id}`,
      requestBody,
      {headers}
    );
    console.log(response.data);
  } catch (error) {
    console.log(error.response.data);
  }
};

//notificar al grupo que la orden fue actualizada
const notificarActualizacion = async (data) => {
  try {
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
    };
    const requestBody = {
      "cliente": data.cliente,
      "sku": data.sku,
      "fechaEntrega": data.vencimiento,
      "cantidad": data.cantidad,
      "urlNotificacion": "nosequeesesto.cl"
   }
    const response = await axios.post(
      `http://lagarto5.ing.puc.cl/ordenes-compra/${data.id}`,
      requestBody,
      {headers}
    );
    console.log(response.data);
  } catch (error) {
    console.log(error.response.data);
  }
};


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
        
            const sku = response.data.sku
        console.log("HOLAAA",sku)
        const producto = Productdictionary[sku];
        // si es una hamburguesa debiera tener una formula que esta en Formulasdictionary
        console.log("RESPONDE", producto)
        if(producto.produccion === "cocina"){
          //buscar en formulas
          console.log("BURGAAA")
          console.log(Formuladictionary[sku])
          for (skuIngrediente in Formuladictionary[sku].ingredientes){
            
            ingrediente = Productdictionary[skuIngrediente];
            const producirRouter = require('./producir');
            const router = producirRouter({getToken, skuIngrediente, ingrediente});
          }
        } 

    }
        catch (error) {
        console.log(error)
    }
}

producir_orden("6470ffd12abc3cdd7509ff9d")

module.exports = router;

//prueba crear orden
const fechaActualUtc = moment.utc();
const fechaHoraUtc4 = fechaActualUtc.add(4, "hours").format("YYYY-MM-DD HH:mm:ss");
const requestBody = {
  "cliente":"5",
  "proveedor":"7",
  "sku":"22993410e2",
  "cantidad":4,
  "vencimiento":fechaHoraUtc4
}
crearOrden(requestBody)

//prueba obtener orden
// idOrden = "64777c884d301e5af39ca255"
// obtenerOrden(idOrden)


//prueba Actualizar estado de Orden de Compra
// requestBody = {
//   "estado": "Aceptada"
// }
// idOrden = ""
// actualizarOrden(requestBody, idOrden)