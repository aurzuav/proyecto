
const axios = require("axios");
const IdAlmacenes = require("./IdAlmacenes");
const Dispatch = require("./Dispatch");
const getToken = require("./getTokenW");
const wait = require("./wait");

async function KitchentoCheckOut(sku, cantidad, idOrden) {
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
        let keyCheckOut;
        almacenes.forEach(almacen => {
            const key = Object.keys(almacen)[0];
            const value = almacen[key];

            if (value === 'almacenCheckOut') {
                keyCheckOut = key;
                return; // Terminar el bucle si se encuentra la clave "kitchen"
            }
        });
        console.log(keyKitchen, keyCheckOut)
        const token = await getToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + `${token}`,
        };
        const stockKitchen = await axios.get(
            `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${keyKitchen}/products?sku=${sku}`,
            {
                headers,
            }
        );
        console.log(stockKitchen.data)
        if (stockKitchen.data.length >= cantidad) {
            console.log("va a mover, la hamburguesa esta ready")
            const listaIds = stockKitchen.data.map(objeto => objeto._id);
            let contador = 0
            requestBody = { store: `${keyCheckOut}` }
            while (contador < cantidad) {
                id = listaIds[contador]
                console.log(listaIds)
                const token = await getToken();
                const headers = {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + `${token}`,
                };
                const moveResponse = await axios.patch(
                    `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products/${id}`,

                    requestBody,
                    { headers }
                )
                console.log(moveResponse.data)
                console.log("lo movi al checkout")
                despachado = false
                while(!despachado){
                    despachado = await Dispatch(idOrden, id)
                    await wait(1 * 60 * 1000); // Espera 3 minutos (3 * 60 segundos * 1000 milisegundos)
                }
                contador += 1
            }
            return true
        }
    } catch (error) {
        console.log(error)
    }
}



module.exports = KitchentoCheckOut;
