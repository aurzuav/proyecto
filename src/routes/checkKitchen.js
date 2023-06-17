const IdAlmacenes = require("./IdAlmacenes");
const getToken = require("./getTokenW");
const axios = require("axios");


async function checkKitchen(formula, cantidad) {
    try {
        const almacenes = await IdAlmacenes()
        let keyKitchen;
        almacenes.forEach(almacen => {
            const key = Object.keys(almacen)[0];
            const value = almacen[key];

            if (value === 'kitchen') {
                keyKitchen = key;
                return; // Terminar el bucle si se encuentra la clave "kitchen"
            }
        });
        //TOKEN
        const token = await getToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + `${token}`,
        };
        const kitchenStockResponse = await axios.get(
            `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${keyKitchen}/inventory`,
            {
                headers,
            }
        );
        console.log("en check kitchen")
        let todosDisponibles = true;
        const disponibles = [];
        const faltantes = [];
        Object.keys(formula).forEach((sku) => {
            const matchingItem = kitchenStockResponse.data.find(
                (item) => item.sku === sku
            );
            if (matchingItem) {
                if (matchingItem.quantity >= cantidad) {
                    disponibles.push(sku);
                } else {
                    faltantes.push(sku);
                    todosDisponibles = false;
                }
            } else {
                faltantes.push(sku);
                todosDisponibles = false;
            }
        });
        return {
            todosDisponibles,
            disponibles,
            faltantes,
        };

    } catch (error) {
        console.log(error)
    }
}
module.exports = checkKitchen
