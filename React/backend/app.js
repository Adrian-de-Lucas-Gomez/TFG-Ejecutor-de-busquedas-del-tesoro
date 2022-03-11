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

const imageUpload = multer({storage: storage})

var aventuraActual = {}

//IMPORTANTE: el imageCharger que aparece como parametro de imageUpload.array()
//tiene que aparecer en el FormData que creamos y posteriormente enviamos puesto
app.post('/image-upload', imageUpload.array("imageCharger"), (req, res) => {
  console.log(req.headers)
  console.log("POST REQUEST recieved in: /image-upload")
})

//Peticion que tiene como objetivo revibir los datos relacionados con una aventura y generar un json que los contenga en el servidor
app.post('/wtf-json', function(request, response){
  aventuraActual = request.body.json;
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
 
  // Le paso al comando el nombre del directorio que hace falta crear y usar para almacenar la aventura
  var commandWindows = '"GeneraZip.bat" '+  JSON.parse(aventuraActual).Gencana ;
  
  const execProcess = exec(commandWindows, { 'encoding': 'utf8' }, (error, stdout) => {
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

  //Peticion para obtener los diferentes directorios dentro de la base de datos para poder luego decidir de cual reescribir la aventura
  app.get("/aventuras-guardadas", (req, res)=>{
    res.json({ Opciones:  fs.readdirSync('../BaseDeDatos/')}); }
  );
  
  //Esta petición tiene como objetivo devolver el json que representa una aventura concreta
  app.post('/dame-aventura', function(request, response){
    var name = JSON.parse(request.body.json).Nombre ;
    console.log("Aventura Solicitada para lectura: "+name);
    var content = fs.readFileSync('../BaseDeDatos/'+name+'/AdventureData.json',{encoding:'utf8', flag:'r'});
    response.json({ AventuraGuardada: content});
  });


  })