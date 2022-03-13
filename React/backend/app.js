import express from "express"
import bodyParser from "body-parser"
import multer from "multer"
import path from "path"
import {fileURLToPath} from 'url';
import { exec, execFile, fork, spawn } from "child_process";
import fs from "fs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Directorio de trabajo actual: ', __dirname);

//Creamos backend con express
const app = express()
//Puerto en el que vamos a escuchar
const port = 3000
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

const packageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Packages')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
})

// const storageJson = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'AdventureData')
//   },
//   filename: (req, file, cb) => {
//     console.log(file)
//     cb(null, file.originalname)

//   }
// })

const imageUpload = multer({storage: storage})
const packageUpload = multer({storage: packageStorage})

//IMPORTANTE: el imageCharger que aparece como parametro de imageUpload.array()
//tiene que aparecer en el FormData que creamos y posteriormente enviamos puesto
app.post('/image-upload', imageUpload.array("imageCharger"), (req, res) => {
  console.log(req.headers)
  console.log("POST REQUEST recieved in: /image-upload")
})

app.post('/package-upload', packageUpload.array("unityPackage"), (req, res) => {
  console.log(req.headers)
  console.log("POST REQUEST recieved in: /package-upload")
})


app.post('/wtf-json', function(request, response){

  //Creamos un fichero json en un directorio que no este bajo el control del server para evitar problemas
  fs.writeFile('../AdventureData.json', request.body.json , function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
});


app.get("/", (req, res)=>{
  //Pagina estatica con lo desarrollado en react
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(port, ()=>{
  console.log("LISTENING ON PORT: " + port)
})

app.get("/generate-zip", (req, res)=>{

  const execProcess = exec('bash GeneraZip.sh', { 'encoding': 'utf8' }, (error, stdout) => {
    //console.log(`exec stdout: ${stdout}`);
    //console.log(`error: ${error}`);
  });

  execProcess.on('exit', () => {
    console.log('exec process exit');
    res.download(path.join(__dirname, '../', 'Aventura.zip'), 'Aventura.zip', function (err) {
    if (err) {
      // Handle error, but keep in mind the response may be partially-sent
      // so check res.headersSent
      console.log("ERROR ON DOWNLOAD ZIP");
    } else {
      // decrement a download credit, etc.
    }
    });
  });


  

  // res.download(path.join(__dirname, './', 'Aventura.zip'), 'Aventura.zip', function (err) {
  //   if (err) {
  //     // Handle error, but keep in mind the response may be partially-sent
  //     // so check res.headersSent
  //     console.log("ERROR ON DOWNLOAD ZIP");
  //   } else {
  //     // decrement a download credit, etc.
  //   }
  //   });

})