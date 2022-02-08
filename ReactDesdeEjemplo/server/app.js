import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import multer from "multer"

//Creamos backend con express
const app = express()
//Puerto en el que vamos a escuchar
const port = 4000

//BODY-PARSER
app.use(bodyParser.urlencoded({ extended: false, limit:"5mb" ,  parameterLimit: 1000000}));
app.use(bodyParser.json({limit:"5mb"}));

//CORS
//Permite que mandemos imagenes desde el origen que settemos cuando estamos mandando/Recibiendo
//de un dominio que no se corresponde con el nuestro. Como actualmente se ejecutan (cliente/server) 
//en el localhost (es decir, no hay un dominio "per se") es necesario marcar las cabeceras de los
//mensajes con CORS para que se permita el envio de imagenes
const corsOrigin = 'http://localhost:3000';
app.use(cors({
  origin:[corsOrigin],
  methods:['GET','POST'],
  credentials: true 
})); 

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
    res.send("Este es el servidor :D")
})

app.listen(port, ()=>{
    console.log("LISTENING ON PORT: " + port)
})