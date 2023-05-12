

const Koa = require("koa");
const KoaLogger = require("koa-logger");
const koaBody = require("koa-body");
const axios = require("axios");
const Router = require("koa-router");
const fs = require("fs");
const csv = require("csv-parser");
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router();
const port = 3000;


app.use(router.routes());
app.use(router.allowedMethods());
app.use(bodyParser());

app.use(async (ctx, next) => {
  await next();
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
});

let productDictionary = {};

// gets token
router.get("/", async (ctx) => {
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

// Esta es una funcion para obtener el token, la usamos para hacer los llamados a la API (necesitan el token como autorizacion)
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

// dispatches products - ver input productid y orderid
router.get("/dispatch", async (ctx) => {
  try {
    const token = await getToken();
    console.log("dispatch");
    console.log(token);

    const headers = {
      "Content-Type": "application/json", // Adjust the content type if necessary
      Authorization: "Bearer " + token,
    };

    const response = await axios.post(
      "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/dispatch",
      { productId: `${productid}`, orderId: `${orderId}` },
      {
        headers,
      }
    ); // Replace with the API endpoint URL
    ctx.body = response.data;
    console.log(response.data);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Esta request es para generar un producto en la bodega.
// Actualmente tiene hardcodeado el sku y la cantidad
// se puede hacer funcion eventualmente para que el usuario ingrese el sku y la cantidad
router.get("/product", async (ctx) => {
  try {
    const token = await getToken();
    console.log("product");
    console.log(token);
    const headers = {
      "Content-Type": "application/json", // Adjust the content type if necessary
      Authorization: "Bearer " + token,
    };
    // en la linea de abajo esta hardcodeado el sku y la cantidad
    const response = await axios.post(
      "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products",
      { sku: "015edda868", quantity: 4 },
      {
        headers,
      }
    ); // Replace with the API endpoint URL
    ctx.body = response.data;
    console.log(response.data);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Esta request es para obtener las distintas bodegas y su informacion
router.get("/inventory", async (ctx) => {
  const token = await getToken();
  console.log("inventory");
  console.log(token);
  try {
    const headers = {
      "Content-Type": "application/json", // Adjust the content type if necessary
      Authorization: "Bearer " + `${token}`,
    };
    console.log(headers);
    const response = await axios.get(
      "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
      {
        headers,
      }
    ); // Replace with the API endpoint URL
    ctx.body = response.data;
    console.log(response.data);
    // quiero obtener el _id de cada uno de los stores
    const storeId_1 = response.data[0]._id;
    const storeId_2 = response.data[1]._id;
    const storeId_3 = response.data[2]._id;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Este llamado es para obtener el inventario de cada bodega e imprimirlo en consola
// creo que este no tiene nada hardcodeado, revisenlo igual
router.get("/stocks", async (ctx) => {
  const token = await getToken();
  try {
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
    console.log(storesResponse.data);
    const stores = storesResponse.data;
    const products = [];
    for (const store of stores) {
      //console.log(store._id);
      const inventoryResponse = await axios.get(
        `https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${store._id}/inventory`,
        {
          headers,
        }
      );
      for (const inventory of inventoryResponse.data) {
        //console.log("entro inventario");
        //console.log(inventory);
        const productIndex = products.findIndex((p) => p.sku === inventory.sku);
        if (productIndex === -1) {
          products.push({
            sku: inventory.sku,
            total: inventory.quantity,
            bodega: inventory.store,
          });
        } else {
          //console.log("entro else");
          //console.log(inventory.quantity);
          //console.log(products[productIndex].total);
          products[productIndex].total += inventory.quantity;
          //console.log(products[productIndex].total);
        }
      }
    }
    console.log(products);
    ctx.body = JSON.stringify(products, null, 2);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Dashboard
router.get("/dashboard", async (ctx) => {
  const token = await getToken();
  console.log("inventory");
  console.log(token);
  try {
    const headers = {
      "Content-Type": "application/json", // Adjust the content type if necessary
      Authorization: "Bearer " + `${token}`,
    };
    console.log(headers);
    const response = await axios.get(
      "https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
      {
        headers,
      }
    ); // Replace with the API endpoint URL

    let table = fs.readFileSync("src/dashboard.html", "utf8")
    response.data.forEach(element => {
      table += dashboardInventory(element);
    });
    table += "</table>"
    const stores = response.data;
   
    for (const store of stores) {
      //agregar tabla y agregar store._id
      table += "<table><tr><th>SKU</th><th>Cantidad</th><br>"
      const inventoryResponse = await axios.get(
        `https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${store._id}/inventory`,
        {
          headers,
        }
      );
      console.log(inventoryResponse.data);
      for (const inventory of inventoryResponse.data) {
        console.log(inventory);
        table += dashboardProduct(inventory);
      }
    }
    ctx.body = table;
    console.log(response.data);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

function dashboardInventory (element){
  const ocupation = (element.usedSpace/element.totalSpace * 100) + "%";
  return (
      `<tr><td>${element._id}</td><td>${element.usedSpace}</td><td>${element.totalSpace}</td><td>${ocupation}</td></tr>`
  )
}

function dashboardProduct (product){
  return (
      `<tr><td>${product.sku}</td><td>${product.quantity}</td></tr>`
  )
}


function getCSVDictionary() {
  console.log("get CSV file...");
  const filePath = "./products.csv";

  readCSVFile(filePath)
    .then((dictionary) => {
      productDictionary = dictionary;
      //console.log(dictionary);
    })
    .catch((error) => {
      console.error(error);
    });
}

function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const dictionary = {};

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const keys = Object.keys(row);
        const key = row[keys[0]];

        const values = keys.slice(1).map((column) => row[column]);

        dictionary[key] = values;
      })
      .on("end", () => {
        resolve(dictionary);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

getCSVDictionary();

// servicios

// Array para llevar el registro de las OC recibidas
const ordenesRecibidas = [];
const ordenesRecibidas2 = [];
const ordenesRecibidas3 = [];
const listInstructions = [];
const listInstructions2 = [];

// servicio 2 - recibe orden
app.use(async (ctx, next) => {
  if (ctx.method === "POST" && ctx.url.startsWith("/ordenes-compra/")) {
    const id_orden = ctx.url.replace("/ordenes-compra/", "");

    const { cliente, sku, fechaEntrega, cantidad, urlNotificacion } =
      ctx.request.body;

    if (ordenesRecibidas.includes(id_orden)) {
      ctx.status = 400;
      ctx.body = { mensaje: "OC ya fue recibida" };
      const instruction = {
        id: id_orden,
        instruction: "post",
      };
      listInstructions.push(instruction);
      writeInstruction(
        "Instruction_S2.txt",
        JSON.stringify(listInstructions, null, 2).replace(/\n/g, "\r\n") + "\r\n"
      );
      return;
    }

    const nuevaOrden = {
      id: id_orden,
      cliente,
      sku,
      fechaEntrega,
      cantidad,
      urlNotificacion,
      estado: "recibida",
    };

    ordenesRecibidas.push(id_orden);
    ordenesRecibidas2.push(nuevaOrden);
    writeFile(
      "Output_S2.txt",
      JSON.stringify(ordenesRecibidas2, null, 2).replace(/\n/g, "\r\n") + "\r\n"
    );

    const instruction = {
      id: id_orden,
      instruction: "post",
    };
    listInstructions.push(instruction);
    writeInstruction(
      "Instruction_S2.txt",
      JSON.stringify(listInstructions, null, 2).replace(/\n/g, "\r\n") + "\r\n"
    );
    //writeInstruction(JSON.stringify(listInstructions) + '\n');

    // Send the response
    ctx.status = 201;
    ctx.body = nuevaOrden;

    console.log("Orden creada exitosamente");
    console.log(nuevaOrden);
  }

  await next();
});

// servicio 3 - consulta estado
app.use(async (ctx, next) => {
  if (ctx.method === "PATCH" && ctx.url.startsWith("/ordenes-compra/")) {
    const id_orden = ctx.url.replace("/ordenes-compra/", "");
    const orden = ordenesRecibidas2.find((orden) => orden.id == id_orden);

    if (!orden) {
      ctx.status = 404;
      ctx.body = { mensaje: "Orden no encontrada" };
      const instruction = {
        id: id_orden,
        estado: ctx.request.body.estado,
      };
      listInstructions2.push(instruction);
      writeInstruction(
        "Instruction_S3.txt",
        JSON.stringify(listInstructions2, null, 2).replace(/\n/g, "\r\n") + "\r\n"
      );
      return;
    }

    orden.estado = ctx.request.body.estado;

    ctx.status = 200;
    ctx.body = orden;
    ordenesRecibidas3.push(orden);
    writeFile(
      "Output_S3.txt",
      JSON.stringify(ordenesRecibidas3, null, 2).replace(/\n/g, "\r\n") + "\r\n"
    );

    const instruction = {
      id: id_orden,
      estado: ctx.request.body.estado,
    };
    listInstructions2.push(instruction);
    writeInstruction(
      "Instruction_S3.txt",
      JSON.stringify(listInstructions2, null, 2).replace(/\n/g, "\r\n") + "\r\n"
    );

    await next();
  }
});

function writeFile(nombre_archivo, data) {
  fs.writeFile(nombre_archivo, data, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
}

function readFile(id_orden, status) {
  fs.readFile("Output.txt", (err, inputD) => {
    if (err) throw err;
    const text = inputD.toString();
    const data = JSON.parse(text);
    for (let i = 0; i < data.length; i++) {
      if (data[i].id == id_orden.toString()) {
        data[i].estado = status;
        writeFile(JSON.stringify(data));
        return 1;
      }
    }
  });
}

function writeInstruction(nombre_archivo, data) {
  fs.writeFile(nombre_archivo, data, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
