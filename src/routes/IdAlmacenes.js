const getToken = require("./getTokenW");
const axios = require("axios");

let almacenes = null;

async function IdAlmacenes() {
    if (almacenes !== null) {
        return almacenes;
    }

    try {
        const token = await getToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + `${token}`,
        };
        const storesResponse = await axios.get(
            "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
            {
                headers,
            }
        );

        almacenes = storesResponse.data.map(store => {
            const almacen = {};

            if (store.checkIn) {
                almacen[store._id] = "almacenCheckIn";
            }
            if (store.buffer) {
                almacen[store._id] = "buffer";
            }
            if (store.checkOut) {
                almacen[store._id] = "almacenCheckOut";
            }
            if (store.kitchen) {
                almacen[store._id] = "kitchen";
            }
            if (!store.checkIn && !store.checkOut && !store.buffer && !store.kitchen) {
                almacen[store._id] = "principal";
            }

            return almacen;
        });

        return almacenes;
    } catch (error) {
        console.log("error en IdAlmadenes.js")
    }
}

module.exports = IdAlmacenes;
