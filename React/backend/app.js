import express from "express"
import bodyParser from "body-parser"
import multer from "multer"
import path from "path"
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Directorio de trabajo actual: ', __dirname);

//Creamos backend con express
const app = express()
//Puerto en el que vamos a escuchar
const port = 4000
app.use(express.static(path.join(__dirname, 'build')));

//BODY-PARSER
app.use(bodyParser.urlencoded({ extended: false, limit:"5mb" ,  parameterLimit: 1000000}));
app.use(bodyParser.json({limit:"5mb"}));

//MULTER
//Middleware que utilizaremos para manipular/acceder al FormData
//que recibimos de la peticion post

//creamos un punto donde vamos a almacenar los archivos que nos lleguen
//actualmente es, si consideramos ReactDesdeEjemplo el root del proyecto,
// /server/Images
//Dichas imagenes se almacenan con el nombre de archivo que tenian 
//al subirlas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
})

const imageUpload = multer({storage: storage})

//IMPORTANTE: el imageCharger que aparece como parametro de imageUpload.array()
//tiene que aparecer en el FormData que creamos y posteriormente enviamos puesto
app.post('/image-upload', imageUpload.array("imageCharger"), (req, res) => {
    console.log(req.headers)
    console.log("POST REQUEST recieved in: /image-upload")
})

app.get("/", (req, res)=>{
    //Pagina estatica con lo desarrollado en react
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(port, ()=>{
    console.log("LISTENING ON PORT: " + port)
})