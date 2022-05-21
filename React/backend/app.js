import express from "express"
import bodyParser from "body-parser"
import multer from "multer"
import path from "path"
import { fileURLToPath } from 'url';
import { exec, execFile, fork, spawn } from "child_process";
import fs, { ReadStream } from "fs";



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

const soundStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Sounds')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
})

const apkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'AplicacionLista')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
})

const overlappingImages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'OverlappingImages')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
})

const imageUpload = multer({ storage: storage })
const packageUpload = multer({ storage: packageStorage })
const soundUpload = multer({ storage: soundStorage })
const apkUpload = multer({ storage: apkStorage })
const overlapingUpload = multer({storage:overlappingImages})

let directoriosDeTrabajo = ["Images", "Packages", "Sounds", "OverlappingImages"];


//////////////////////////////////////////Peticiones para recibir ficheros////////////////////////////////////////////////////


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
  res.json({ key: "value" });
})

app.post('/overlapping_upload', overlapingUpload.array("overlap"), (req, res) => {
  console.log(req.headers)
  console.log("POST REQUEST recieved in: /overlapping_upload")
  res.json({ key: "value" });
})

app.post('/sound-upload', soundUpload.array("sound"), (req, res) => {
  console.log(req.headers)
  console.log("POST REQUEST recieved in: /sound-upload")
  res.json({ key: "value" });
})

//Request para almacenar en el server una apk junto con las demas hechas por los usuarios
app.post('/apk-upload', apkUpload.array("apk"), (req, res) => {
  console.log(req.headers);
  console.log("POST REQUEST recieved in: /apk-upload");
  res.json({ key: "value" });
})

//////////////////////////////////////////Peticiones para recibir ficheros////////////////////////////////////////////////////


app.get("/", (req, res) => {
  //Pagina estatica con lo desarrollado en react
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(port, () => {
  console.log("LISTENING ON PORT: " + port)
})


//////////////////////////////////////////Peticiones para solicitar la creacion del proyecto que permite crear la aventura////////////////////////////////////////////////////

//Peticion para obtener los diferentes directorios dentro de la base de datos para poder luego decidir de cual reescribir la aventura
app.get("/reset", (req, res) => {

  //Recorro los diferentes directorios de trabajo y elimino todos los archivos que encuentre en ellos excepto los Readme 
  for(let j = 0; j<directoriosDeTrabajo.length; j++){
    var filesToRemove = fs.readdirSync("./"+directoriosDeTrabajo[j]+"/");
    for (var i = 0; i < filesToRemove.length; i++) {
      //Si no es el readme, lo elimino del directorio
      if (filesToRemove[i] !== "README.txt") {
        console.log("Removed file from backend/"+directoriosDeTrabajo[j]+"/ directory: " + filesToRemove[i]);
        fs.unlinkSync("./"+directoriosDeTrabajo[j]+"/" + filesToRemove[i]);
      }
    }
  }

  //Limpieza de los sonidos que hubiera en el backend
  var apkToRemove = fs.readdirSync('./AplicacionLista/');
  for(let i  =0 ; i < apkToRemove.length; i++){
    if (apkToRemove[i] !== "README.txt") {
      console.log("Removed file from backend/AplicacionLista/ directory: " + apkToRemove[i]);
      fs.unlinkSync('./AplicacionLista/' + apkToRemove[i]);
    }
  }

  res.json({ key: "value" });
});

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

//Peticion que tiene como objetivo revibir los datos relacionados con una aventura y generar un json que los contenga en el servidor
app.post('/guardame-json', function (request, res) {
  try {
    //Creamos un fichero json en un directorio que no este bajo el control del server para evitar problemas
    fs.writeFileSync('../AdventureData.json', request.body.json);
  }
  catch { console.log("An error ocurred getting the adventure json") }
  console.log("The adventure json was succesfully recieved");
  res.json({ key: "value" });
});
//////////////////////////////////////////Peticiones para solicitar la creacion del proyecto que permite crear la aventura////////////////////////////////////////////////////


//////////////////////////////////////////Peticiones para guardar una APK nueva en el servidor dada una descripción////////////////////////////////////////////////////
//Peticion que tiene como objetivo revibir los datos relacionados con una aventura y generar un json que los contenga en el servidor
app.post('/guardame-APK', function (request, res) {
  try {
    //Creo el directorio en el que van a almacenarse la descripción y la apk
    if(fs.existsSync("../AplicacionesListas/"+request.body.nombre) === false)
      fs.mkdirSync("../AplicacionesListas/"+request.body.nombre);

    //Creamos un fichero json en un directorio que no este bajo el control del server para evitar problemas
    fs.writeFileSync('../AplicacionesListas/'+request.body.nombre+"/descripcion.txt", request.body.description);

    var file = fs.readdirSync("./AplicacionLista/");
    for (var i = 0; i < file.length; i++) {
      try {
        if (file[i] !== "README.txt") 
          fs.copyFileSync('./AplicacionLista/' + file[i], "../AplicacionesListas/"+request.body.nombre+"/"+file[i]);
      }
      catch { console.log("An error ocurred copying a file:" + file[i]); }
    }

    var filesToRemove = fs.readdirSync("./AplicacionLista/");
      for (var i = 0; i < filesToRemove.length; i++) {
        //Si no es el readme, lo elimino del directorio
        if (filesToRemove[i] !== "README.txt") {
          fs.unlinkSync("./AplicacionLista/"+ filesToRemove[i]);
          console.log("Removed file from /AplicacionLista/ directory: " + filesToRemove[i]);
        }
      }

  }
  catch { console.log("An error ocurred getting the adventure json") }
  console.log("The adventure description was succesfully recieved");
  res.json({ key: "value" });
});
//////////////////////////////////////////Peticiones para guardar una APK nueva en el servidor dada una descripción////////////////////////////////////////////////////

//////////////////////////////////////////Peticiones para guardar la configuración de una aventura nueva en el servidor ////////////////////////////////////////////////////
//Peticion que recibe una aventura y crea un nuevo directorio en la base de datos para meter en este el json de esta y todos los ficheros involucrados
app.post('/guardame-aventura', function (req, res) {
// app.get("/guardame-aventura", (req, res)=>{
  //Sacamos el nombre de la aventura y determinamos el directorio en el que vamos a guardar las cosas
  var name = req.body.nombre;
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
    else{
      fs.mkdirSync(dir);
      fs.mkdirSync(dir+"/Images");
      fs.mkdirSync(dir+"/Packages");
      fs.mkdirSync(dir+"/Sounds");
      fs.mkdirSync(dir+"/OverlappingImages");
    }
  }
  catch { console.log("An error ocurred creating the directory: " + dir); }
  console.log("Directory created: " + dir);

  //Paso por todos los directorios de trabajo y copio todos los archivos existentes que interesen para la aventura en el directorio de BaseDeDatos para almacenar la configuracion
  for(let j = 0; j<directoriosDeTrabajo.length; j++){
    var filesToSave = fs.readdirSync("./"+directoriosDeTrabajo[j]+"/");
    for (var i = 0; i < filesToSave.length; i++) {
    //Si no es el readme, lo elimino del directorio
      fs.copyFileSync("./"+ directoriosDeTrabajo[j]+"/" + filesToSave[i], '../BaseDeDatos/' + name + "/"+directoriosDeTrabajo[j]+"/" + filesToSave[i]);
    }
  }

  //Recorro los diferentes directorios de trabajo y elimino todos los archivos que encuentre en ellos excepto los Readme 
  for(let j = 0; j<directoriosDeTrabajo.length; j++){
    var filesToRemove = fs.readdirSync("./"+directoriosDeTrabajo[j]+"/");
    for (var i = 0; i < filesToRemove.length; i++) {
      //Si no es el readme, lo elimino del directorio
      if (filesToRemove[i] !== "README.txt") {
        console.log("Removed file from backend/"+directoriosDeTrabajo[j]+"/ directory: " + filesToRemove[i]);
        fs.unlinkSync("./"+directoriosDeTrabajo[j]+"/" + filesToRemove[i]);
      }
    }
  }
  fs.writeFileSync('../BaseDeDatos/' + name + "/descripcion.txt", req.body.descripcion);
  //Queda copiar el json que contiene la aventura
  try {
    fs.copyFileSync('../AdventureData.json', '../BaseDeDatos/' + name + '/AdventureData.json');
  }
  catch {
    console.log("An error ocurred copying AdventureData file to the DataBase");
  }

  res.json({ key: "value" });
});
//////////////////////////////////////////Peticiones para guardar la configuración de una aventura nueva en el servidor ////////////////////////////////////////////////////


//////////////////////////////////////////Peticiones para recuperar la configuración de una aventura guardada y continuar a partir de ella////////////////////////////////////////////////////
//Esta petición tiene como objetivo devolver el json que representa una aventura concreta
app.post('/dame-aventura', function (request, response) {

  //Me hago con el nombre de la aventura que nos están pidiendo
  var name = JSON.parse(request.body.json).Nombre;
  console.log("Aventura Solicitada para lectura: " + name);
  var content = fs.readFileSync('../BaseDeDatos/' + name + '/AdventureData.json', { encoding: 'utf8', flag: 'r' });

  //Me quedo con el nombre de los archivos que hay en el directorio Images
  //Voy uno por uno para eliminarlos y que no metan ruido a la futura build, en caso de que hayan archivos que no se usen
  for(let j = 0; j<directoriosDeTrabajo.length; j++){
    var filesToRemove = fs.readdirSync("./"+directoriosDeTrabajo[j]+"/");
    for (var i = 0; i < filesToRemove.length; i++) {
      //Si no es el readme, lo elimino del directorio
      if (filesToRemove[i] !== "README.txt") {
        console.log("Removed file from backend/Images/ directory: " + filesToRemove[i]);
        fs.unlinkSync("./"+directoriosDeTrabajo[j]+"/" + filesToRemove[i]);
      }
    }
  }

  //Me quedo con el nombre de los archivos que hay en el directorio de la base de datos y los paso
  //al directorio correspondiente para que cuando el jugador le de a crear aventura que todo esté listo para moverlo
  //a la build
  for(let j = 0; j<directoriosDeTrabajo.length; j++){
    var files = fs.readdirSync('../BaseDeDatos/' + name+"/"+directoriosDeTrabajo[j] + '/');
    for (var i = 0; i < files.length; i++) {
      fs.copyFile('../BaseDeDatos/' + name + '/'+directoriosDeTrabajo[j]+"/" + files[i], "./"+directoriosDeTrabajo[j]+"/" + files[i], (err) => {
        if (err) console.log("An error ocurred copying a file");
      });
    }
  }
  response.json({ AventuraGuardada: content });
});
//////////////////////////////////////////Peticiones para recuperar la configuración de una aventura guardada y continuar a partir de ella////////////////////////////////////////////////////


//////////////////////////////////////////Peticiones para solicitar la descarga de un archivo que este en el servidor////////////////////////////////////////////////////
//Peticion para obtener algun que otro fichero que se encuentre almacenado en la carpeta Images
app.get('/getFile/:name', function (req, res, next) {

  //Segun el nombre que me han pasado, miro en los 3 directorios posibles que hay en el backend, y si en alguno de ellos 
  //se encuentra en archivo se lo doy al usuario
  for(let i = 0; i<directoriosDeTrabajo.length; i++){
    let path = "./"+directoriosDeTrabajo[i]+"/"+req.params.name;
    if (fs.existsSync(path)) { 
      res.download(path, req.params.name, function (err) {});
      break;
    } 
  }
})

//Peticion para obtener una del las aplicaciones ya hechas en el server
app.get('/getAPK/:name', function (req, res, next) {
  let path = '../AplicacionesListas/' + req.params.name+"/"+req.params.name+".apk";
  if (fs.existsSync(path)) { 
    res.download(path, req.params.name, function (err) {});
  } 
})
//////////////////////////////////////////Peticiones para solicitar la descarga de un archivo que este en el servidor////////////////////////////////////////////////////



//////////////////////////////////////////Peticiones para solicitar las aventuras guardas en el servidor////////////////////////////////////////////////////
//Peticion para obtener los diferentes directorios dentro de la base de datos para poder luego decidir de cual reescribir la aventura
app.get("/aventuras-guardadas", (req, res) => {
  let nombresAventuras=fs.readdirSync('../BaseDeDatos/');
  let descripcionesAventuras=[];
  for(let i = 0 ; i< nombresAventuras.length;i++){
    let dir = '../BaseDeDatos/'+nombresAventuras[i]+'/descripcion.txt';
    var content = "Aventura sin descripcion";
    if (fs.existsSync(dir)) { 
      content = fs.readFileSync(dir, { encoding: 'utf8', flag: 'r' });
    }
    descripcionesAventuras.push(content);
  }
  res.json({ Opciones: nombresAventuras, Descripciones: descripcionesAventuras });
  }
);


//Peticion para obtener los nombres de las diferentes apks ya hechas que se encuentran almacenadas en el server
app.get("/aplicacionesListas-guardadas", (req, res) => {

  let listaAventuras= fs.readdirSync('../AplicacionesListas/');
  let listaDirectoriosAventuras = [];
  let listaDescripciones = [];

  for(let i = 0; i<listaAventuras.length;i++){
    if(listaAventuras[i] !== "README.txt"){
      var content = fs.readFileSync('../AplicacionesListas/' + listaAventuras[i] + '/descripcion.txt', { encoding: 'utf8', flag: 'r' });
      listaDescripciones.push(content);
      listaDirectoriosAventuras.push(listaAventuras[i]);
    }
  }

  res.json({ Opciones: listaDirectoriosAventuras, Descripciones: listaDescripciones});
  }
);
//////////////////////////////////////////Peticiones para solicitar las aventuras guardas en el servidor////////////////////////////////////////////////////