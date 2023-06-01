const csv = require("csv-parser");
const fs = require("fs");

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


  module.exports = {
    getCSVDictionaryProducts,
    getCSVDictionaryFormula
  };