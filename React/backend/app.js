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
  //var command = "GeneraZip.bat";
  var command = "bash GeneraZip.sh";
  const execProcess = exec(command, { 'encoding': 'utf8' }, (error, stdout) => {
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
});

app.get("/guardame-aventura", (req, res)=>{
  // Le paso al comando el nombre del directorio que hace falta crear y usar para almacenar la aventura
  //var command = "GuardarAventura.bat " +  JSON.parse(aventuraActual).Gencana ;
  var command = "bash GuardarAventura.sh " +  JSON.parse(aventuraActual).Gencana ;
  console.log("Se busca guardar una aventura llamada "+JSON.parse(aventuraActual).Gencana);
  const execProcess = exec(command, { 'encoding': 'utf8' }, (error, stdout) => {
    //console.log(`exec stdout: ${stdout}`);
    //console.log(`error: ${error}`);
  });
});


app.get("/guardame-aventuranode", async (req, res)=>{
  //Sacamos el nombre de la aventura y determinamos el directorio en el que vamos a guardar las cosas
  var name = JSON.parse(aventuraActual).Gencana;
  var dir ="../BaseDeDatos/" + name;
  await fs.mkdir(dir, (err) => {
      if (err) {throw err;}
      console.log("Directory created: "+dir);
  });

  //Me quedo con el nombre de los archivos que hay en el directorio Images
  //Voy uno por uno para eliminarlos y que no metan ruido a la futura build, en caso de que hayan archivos que no se usen
  var filesToSave = fs.readdirSync('./Images/');
  for(var i = 0; i< filesToSave.length;i++){
    console.log('File Copy Successfully: '+filesToSave[i]);
    await fs.copyFile('./Images/'+filesToSave[i],'../BaseDeDatos/'+name+'/'+filesToSave[i], (err) => {
      if (err) console.log("An error ocurred copying a file");
    });
  }

  //Me quedo con el nombre de los archivos que hay en el directorio Images
  //Voy uno por uno para eliminarlos y que no metan ruido a la futura build, en caso de que hayan archivos que no se usen
  var filesToRemove = fs.readdirSync('./Images/');
  for(var i = 0; i< filesToRemove.length;i++){
    //Si no es el readme, lo elimino del directorio
    if(filesToRemove[i] !== "README.txt"){
      console.log("Removed file from backend/Images/ directory: "+filesToRemove[i]);
      await fs.unlinkSync('./Images/'+filesToRemove[i]);
    }
  }

  //Queda copiar el json que contiene la aventura
  await fs.copyFile('../AdventureData.json','../BaseDeDatos/'+name+'/AdventureData.json', (err) => {
    if (err) console.log("An error ocurred copying AdventureData file to the DataBase");
  });
});



//Peticion para obtener los diferentes directorios dentro de la base de datos para poder luego decidir de cual reescribir la aventura
app.get("/aventuras-guardadas", (req, res)=>{
  res.json({ Opciones:  fs.readdirSync('../BaseDeDatos/')}); }
);

//Esta petición tiene como objetivo devolver el json que representa una aventura concreta
app.post('/dame-aventura', function(request, response){

  //Me hago con el nombre de la aventura que nos están pidiendo
  var name = JSON.parse(request.body.json).Nombre ;
  console.log("Aventura Solicitada para lectura: "+name);
  var content = fs.readFileSync('../BaseDeDatos/'+name+'/AdventureData.json',{encoding:'utf8', flag:'r'});

  //Me quedo con el nombre de los archivos que hay en el directorio Images
  //Voy uno por uno para eliminarlos y que no metan ruido a la futura build, en caso de que hayan archivos que no se usen
  var filesToRemove = fs.readdirSync('./Images/');
  for(var i = 0; i< filesToRemove.length;i++){
    //Si no es el readme, lo elimino del directorio
    if(filesToRemove[i] !== "README.txt"){
      console.log("Removed file from backend/Images/ directory: "+filesToRemove[i]);
      fs.unlinkSync('./Images/'+filesToRemove[i]);
    }
  }

  //Me quedo con el nombre de los archivos que hay en el directorio de la base de datos y los paso
  //al directorio Images para que cuando el jugador le de a crear aventura que todo esté listo para moverlo
  //a la build
  var files = fs.readdirSync('../BaseDeDatos/'+name+'/');
  for(var i = 0; i< files.length;i++){
    //Si no es la aventura, lo copio, solo me interesan las imágenes
    if(files[i] !== "AdventureData.json"){
      console.log('File Copy Successfully: '+files[i]);
      fs.copyFile('../BaseDeDatos/'+name+'/'+files[i] , './Images/'+files[i], (err) => {
        if (err) console.log("An error ocurred copying a file");
      });
    }
  }
  response.json({ AventuraGuardada: content});
});