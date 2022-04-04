import express from "express"
import bodyParser from "body-parser"
import multer from "multer"
import path from "path"
import { fileURLToPath } from 'url';
import { exec, execFile, fork, spawn } from "child_process";
import fs from "fs";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Directorio de trabajo actual: ', __dirname);

//Creamos backend con express
const app = express()
//Puerto en el que vamos a escuchar
const port = 3000
app.use(express.static(path.join(__dirname, 'build')));

//BODY-PARSER
app.use(bodyParser.urlencoded({ extended: false, limit: "5mb", parameterLimit: 1000000 }));
app.use(bodyParser.json({ limit: "5mb" }));

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

const imageUpload = multer({ storage: storage })
const packageUpload = multer({ storage: packageStorage })

var aventuraActual = {}

//IMPORTANTE: el imageCharger que aparece como parametro de imageUpload.array()
//tiene que aparecer en el FormData que creamos y posteriormente enviamos puesto
app.post('/image-upload', imageUpload.array("imageCharger"), (req, res) => {
  console.log(req.headers)
  console.log("POST REQUEST recieved in: /image-upload")
  res.json({ key: "value" });
})

app.post('/package-upload', packageUpload.array("unityPackage"), (req, res) => {
  console.log(req.headers)
  console.log("POST REQUEST recieved in: /package-upload")
})


app.get("/", (req, res) => {
  //Pagina estatica con lo desarrollado en react
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(port, () => {
  console.log("LISTENING ON PORT: " + port)
})


app.get("/generate-zip", (req, res)=>{
  try{
    fs.unlinkSync('../Aventura.zip');
    console.log("Deleted zip");
  }
  catch {
    console.log("Couldnt remove .zip from server");
  }
  // Le paso al comando el nombre del directorio que hace falta crear y usar para almacenar la aventura
  var command = "GeneraZip.bat";
  //var command = "bash GeneraZip.sh";
  const execProcess = exec(command, { 'encoding': 'utf8' }, (error, stdout) => {});
  execProcess.on('exit', () => {
    console.log('exec process exit');
    res.download(path.join(__dirname, '../', 'Aventura.zip'), 'Aventura.zip', function (err) {
    if (err) {
      console.log("ERROR ON DOWNLOAD ZIP");
    }
    });
  });
});

//Peticion para obtener los diferentes directorios dentro de la base de datos para poder luego decidir de cual reescribir la aventura
app.get("/reset", (req, res) => {
  //Me quedo con el nombre de los archivos que hay en el directorio Images
  //Voy uno por uno para eliminarlos y que no metan ruido a la futura build, en caso de que hayan archivos que no se usen
  var filesToRemove = fs.readdirSync('./Images/');
  for (var i = 0; i < filesToRemove.length; i++) {
    //Si no es el readme, lo elimino del directorio
    if (filesToRemove[i] !== "README.txt") {
      console.log("Removed file from backend/Images/ directory: " + filesToRemove[i]);
      fs.unlinkSync('./Images/' + filesToRemove[i]);
    }
  }

  var packagesToRemove = fs.readdirSync('./Packages/');
  for(let i  =0 ; i < packagesToRemove.length; i++){
    if (packagesToRemove[i] !== "README.txt") {
      console.log("Removed file from backend/Packages/ directory: " + packagesToRemove[i]);
      fs.unlinkSync('./Packages/' + packagesToRemove[i]);
    }
  }
  res.json({ key: "value" });
});

//Peticion que tiene como objetivo revibir los datos relacionados con una aventura y generar un json que los contenga en el servidor
app.post('/wtf-json', function (request, res) {
  aventuraActual = request.body.json;
  try {
    //Creamos un fichero json en un directorio que no este bajo el control del server para evitar problemas
    fs.writeFileSync('../AdventureData.json', request.body.json);
  }
  catch { console.log("An error ocurred getting the adventure json") }
  console.log("The adventure json was succesfully recieved");
  res.json({ key: "value" });
});


//Peticion que recibe una aventura y crea un nuevo directorio en la base de datos para meter en este el json de esta y todos los ficheros involucrados
app.get("/guardame-aventura", (req, res)=>{
  //Sacamos el nombre de la aventura y determinamos el directorio en el que vamos a guardar las cosas
  var name = JSON.parse(aventuraActual).Gencana;
  var dir = "../BaseDeDatos/" + name;
  try {
    //Si ya existe el directorio hace falta eliminar todo lo que tenga dentro, porque aunque los archivos con el mismo nombre se sobreescriban y no den problemas
    //aquellos que no se sobreescriban van a quedarse almacenados y provocar ruido en las futuras builds, van a estar presentes y no se van a usar, por lo que 
    //lo único que van a hacer es ocupar espacio extra
    if(fs.existsSync(dir)){
      var filesToRemove = fs.readdirSync(dir);
      for (var i = 0; i < filesToRemove.length; i++) {
        //Si no es el readme, lo elimino del directorio
        if (filesToRemove[i] !== "README.txt") {
          fs.unlinkSync(dir+"/"+ filesToRemove[i]);
          console.log("Removed file from /BaseDeDatos/ directory: " + filesToRemove[i]);
        }
      }
    }
    else
      fs.mkdirSync(dir);
  }
  catch { console.log("An error ocurred creating the directory: " + dir); }
  console.log("Directory created: " + dir);

  //Me quedo con el nombre de los archivos que hay en el directorio Images
  //Voy uno por uno para eliminarlos y que no metan ruido a la futura build, en caso de que hayan archivos que no se usen
  var filesToSave = fs.readdirSync('./Images/');
  for (var i = 0; i < filesToSave.length; i++) {
    let nombreF = filesToSave[i];
    try {
      fs.copyFileSync('./Images/' + filesToSave[i], '../BaseDeDatos/' + name + '/' + filesToSave[i]);
    }
    catch { console.log("An error ocurred copying a file:" + filesToSave[i]); }

    console.log('File Copy Successfully: ' + nombreF);
  }

  //Me quedo con el nombre de los archivos que hay en el directorio Images
  //Voy uno por uno para eliminarlos y que no metan ruido a la futura build, en caso de que hayan archivos que no se usen
  var filesToRemove = fs.readdirSync('./Images/');
  for (var i = 0; i < filesToRemove.length; i++) {
    //Si no es el readme, lo elimino del directorio
    if (filesToRemove[i] !== "README.txt") {
      fs.unlinkSync('./Images/' + filesToRemove[i]);
      console.log("Removed file from /Images/ directory: " + filesToRemove[i]);
    }
  }
  //Queda copiar el json que contiene la aventura
  try {
    fs.copyFileSync('../AdventureData.json', '../BaseDeDatos/' + name + '/AdventureData.json');
  }
  catch {
    console.log("An error ocurred copying AdventureData file to the DataBase");
  }

  res.json({ key: "value" });
});



//Peticion para obtener los diferentes directorios dentro de la base de datos para poder luego decidir de cual reescribir la aventura
app.get("/aventuras-guardadas", (req, res) => {
  res.json({ Opciones: fs.readdirSync('../BaseDeDatos/') });
}
);


//Peticion para obtener algun que otro fichero que se encuentre almacenado en la carpeta Images
app.get('/getFile/:name', function (req, res, next) {
  //Saco la ruta en la que se encuentra lo que nos están pidiendo y le digo a quien lo haya pedido que lo descargue
  var filePath = './Images/'+req.params.name;
  res.download(filePath, req.params.name, function (err) {
    if (err) {
      console.log("ERROR ON DOWNLOAD image");
    } 
  });
})


//Esta petición tiene como objetivo devolver el json que representa una aventura concreta
app.post('/dame-aventura', function (request, response) {

  //Me hago con el nombre de la aventura que nos están pidiendo
  var name = JSON.parse(request.body.json).Nombre;
  console.log("Aventura Solicitada para lectura: " + name);
  var content = fs.readFileSync('../BaseDeDatos/' + name + '/AdventureData.json', { encoding: 'utf8', flag: 'r' });

  //Me quedo con el nombre de los archivos que hay en el directorio Images
  //Voy uno por uno para eliminarlos y que no metan ruido a la futura build, en caso de que hayan archivos que no se usen
  var filesToRemove = fs.readdirSync('./Images/');
  for (var i = 0; i < filesToRemove.length; i++) {
    //Si no es el readme, lo elimino del directorio
    if (filesToRemove[i] !== "README.txt") {
      console.log("Removed file from backend/Images/ directory: " + filesToRemove[i]);
      fs.unlinkSync('./Images/' + filesToRemove[i]);
    }
  }

  //Me quedo con el nombre de los archivos que hay en el directorio de la base de datos y los paso
  //al directorio Images para que cuando el jugador le de a crear aventura que todo esté listo para moverlo
  //a la build
  var files = fs.readdirSync('../BaseDeDatos/' + name + '/');
  for (var i = 0; i < files.length; i++) {
    //Si no es la aventura, lo copio, solo me interesan las imágenes
    if (files[i] !== "AdventureData.json") {
      console.log('File Copy Successfully: ' + files[i]);
      fs.copyFile('../BaseDeDatos/' + name + '/' + files[i], './Images/' + files[i], (err) => {
        if (err) console.log("An error ocurred copying a file");
      });
    }
  }
  response.json({ AventuraGuardada: content });
});