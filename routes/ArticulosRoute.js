const express = require("express");
const multer = require("multer");

const ArticuloController = require("../controllers/ArticuloController.js")

const router = express.Router();

const almacenamiento = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./imagenes/articulos/")
    },

    filename: function(req, file, cb){
        cb(null, "articulo" + Date.now() + file.originalname)
    }
})

const subidas = multer({storage: almacenamiento})

//Rutas
router.post("/crear", ArticuloController.crear);

router.get("/listar/:ultimos?", ArticuloController.listar);

router.get("/articulo/:id", ArticuloController.uno);

router.delete("/articulo/:id", ArticuloController.borrar);

router.put("/articulo/:id", ArticuloController.editar);

router.post("/subir-imagen/:id", [subidas.single("file0")],ArticuloController.subir);

router.get("/imagen/:fichero", ArticuloController.imagen);

router.get("/buscar/:busqueda", ArticuloController.buscador);

module.exports = router;