const getToken = require("./getTokenW");
const axios = require("axios");

async function IdAlmacenes() {
    try {
        //TOKEN
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
        //OBTENER ID DE almacenes

        const almacenes = [];

        storesResponse.data.forEach(store => {
            const almacen = {};

            if (store.checkIn) {
                almacen[store._id] = "almacenCheckIn";
            }
            if (store.checkOut) {
                almacen[store._id] = "almacenCheckOut";
            }
            if (store.buffer) {
                almacen[store._id] = "buffer";
            }
            if (store.kitchen) {
                almacen[store._id] = "kitchen";
            }
            if (!store.checkIn && !store.checkOut && !store.buffer && !store.kitchen) {
                almacen[store._id] = "principal";
            }
            almacenes.push(almacen);
        });
        return almacenes
    } catch (error) {

    }
}
module.exports = IdAlmacenes
