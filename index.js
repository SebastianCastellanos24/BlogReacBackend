const {conexion} = require("./dataBase/conexion.js")
const express = require("express");
const cors = require("cors")

//Iniciar App
console.log("App de node iniciada")

//Conectar a la base de datos
conexion();

// Crear servidor Node
const app = express();
const puerto = 3900

//Configurar el CORS
app.use(cors());

//Convertir Body a objeto Js
app.use(express.json()); //Recibir datos con content type app/json
app.use(express.urlencoded({extended: true})); //Recibir datos por form url encode

//Rutas
const rutas_articulos = require("./routes/ArticulosRoute.js")

//Cargado de rutas
app.use("/api", rutas_articulos);

//Crear servidor y escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor en el puerto " + puerto)
})