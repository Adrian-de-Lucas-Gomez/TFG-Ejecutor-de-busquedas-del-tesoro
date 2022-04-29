import { StepComponentProps } from '../Steps';
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import axios from "axios"
import AdventureCard from "./AdventureCard"
import swal from "sweetalert";
import Swal from 'sweetalert2'


const AdventureCharger = (props: StepComponentProps): JSX.Element => {

    //Indice de la aventtra que estamos seleccionando
    const [indiceAventura, setIndiceAventura] = useState<number>(0);
    //Lista de las aventuras que el server nos ha informado que existen y que podemos seleccionar y cargar
    const [aventurasDisponibles, setAventurasDisponibles] = useState<any>([]);
    const [descripcionesAventurasDisponibles, setDescripcionesAventurasDisponibles] = useState<any>([]);

    const [aplicacionesDisponibles, setAplicacionesDisponibles] = useState<any>([]);
    const [descripcionesAplicacionesDisponibles, setDescripcionesAplicacionesDisponibles] = useState<any>([]);


    const [aplicacionSubida, setAplicacionSubida]= useState<File | null >(null);

    const [descripcionAventura, setDescripcionAventura] = useState<string >("");

    //Nada más empezar lo que hago es pedirle al server las aventuras que tenemos disponibles para cargar 
    useEffect(() => {
      axios.get("./aventuras-guardadas").then (response => {
        //Seteamos las aventuras que tenemos disponibles a lo que nos ha dicho el server
        console.log("Las opciones son "+response.data.Opciones);
        setAventurasDisponibles(response.data.Opciones);
        setDescripcionesAventurasDisponibles(response.data.Descripciones);
        
        //Ponemos el texto a una cosa u otra para informar al jugador de lo que se está seleccionando
        if(response.data.Opciones.length < 1){}
        else {
          setIndiceAventura(0);
        }})

        axios.get("./aplicacionesListas-guardadas").then (response => {
          //Seteamos las aventuras que tenemos disponibles a lo que nos ha dicho el server
          console.log("Las APKs son "+response.data.Opciones);
          console.log("Las descripciones son "+response.data.Descripciones);

          setAplicacionesDisponibles(response.data.Opciones);
          setDescripcionesAplicacionesDisponibles(response.data.Descripciones);

          //Ponemos el texto a una cosa u otra para informar al jugador de lo que se está seleccionando
          if(response.data.Opciones.length < 1){}
          else {
            setIndiceAventura(0);
          }})


        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, []);


  //Método que mira la aventura que estamos seleccionando en cada momento y le pide al server que nos la de
  //en caso de que no exista alerta al usuario de que no hay nada que cargar
  const cargarAventura = async () =>{       
    if(aventurasDisponibles.length <1 ){
      alert("No hay aventuras disponibles"); 
      return;
    }
    //Le pido al server una aventura con un nombre que se le indica, y cuando nos llegue la cargamos en nuestro estado global de react
    var jsonFinal = {Nombre: aventurasDisponibles[indiceAventura] }

    //Solicito el json de la aventura en cuestion
    const response = await axios.post("./dame-aventura", {json:JSON.stringify(jsonFinal, null, 2)});
    props.setState('adventureName',JSON.parse(response.data.AventuraGuardada).Gencana, "Nombre por defecto");
    
    //Miro por el json para buscar las  imagenes que contiene la aventura
    var fases = JSON.parse(response.data.AventuraGuardada).fases;
    for(let i = 0; i < fases.length;i++){
      var faseActual = fases[i];
      //En caso de que sea una fase de tipo imagen
      if(faseActual.tipo === "ImageStage"){   
        //pido al server que me de una imagen que s ellame asi
        var fileName=faseActual.Imagen;
        let reset = await axios.get("./getFile/"+fileName, {responseType: 'arraybuffer',headers: {'Content-Type': 'application/json'},params: {json:"JSON.stringify(jsonFinal, null, 2)"}});
        const type = reset.headers['content-type']
        const blob = new Blob([reset.data], { type: type })

        //Genero un archivo con dicho archivo que me han dado y me lo guardo
        let myData = {tipo:"ImageStage" ,Imagen: new File([blob], fileName)};
        fases.splice(i,1,myData);
        console.log("Acabamos de recuperar una imagen: "+fileName);
      }
    }
    
    //Como hemos cargado cosas vamos a resetear los indices relacionados con la configuración de la aventura
    props.setState<number>('WhereToPush',0,0);
    props.setState<number>('FaseConfigurable',0,0);
    props.setState<number>('FaseABorrar',0,0);

    //Me guardo las fases que acabamos de conseguir tras cargar la aventura
    props.setState('DATA',fases, []);
  }

  const ponerACargar = async (index:number)=>{
    if(aventurasDisponibles.length <1 ){
      alert("No hay aventuras disponibles"); 
      return;
    }
    //Le pido al server una aventura con un nombre que se le indica, y cuando nos llegue la cargamos en nuestro estado global de react
    var jsonFinal = {Nombre: aventurasDisponibles[index] }

    //Solicito el json de la aventura en cuestion
    const response = await axios.post("./dame-aventura", {json:JSON.stringify(jsonFinal, null, 2)});
    props.setState('adventureName',JSON.parse(response.data.AventuraGuardada).Gencana, "Nombre por defecto");
    
    //Miro por el json para buscar las  imagenes que contiene la aventura
    var fases = JSON.parse(response.data.AventuraGuardada).fases;
    for(let i = 0; i < fases.length;i++){
      var faseActual = fases[i];
      //En caso de que sea una fase de tipo imagen
      if(faseActual.tipo === "ImageStage" || faseActual.tipo === "SoundStage" || faseActual.tipo === "ImageTargetStage"){  
        
        var fileName ="";
        //Me quedo con el nombre del archivo correspondiente a la fase que estemos recuperando
        if(faseActual.tipo === "ImageStage")              fileName=faseActual.Imagen;
        else if(faseActual.tipo === "SoundStage")         fileName=faseActual.Sonido;
        else if(faseActual.tipo === "ImageTargetStage")   fileName=faseActual.Target;

        let reset = await axios.get("./getFile/"+fileName, {responseType: 'arraybuffer',headers: {'Content-Type': 'application/json'},params: {json:"JSON.stringify(jsonFinal, null, 2)"}});
        const type = reset.headers['content-type']
        const blob = new Blob([reset.data], { type: type })

        let myData = faseActual;
        if(faseActual.tipo === "ImageStage")              myData.Imagen= new File([blob], fileName);
        else if(faseActual.tipo === "SoundStage")         myData.Sonido= new File([blob], fileName);
        else if(faseActual.tipo === "ImageTargetStage")   myData.Target = new File([blob], fileName);
        
        fases.splice(i,1,myData);
        console.log("Acabamos de recuperar un fichero: "+fileName);
      }
  }

    //Como hemos cargado cosas vamos a resetear los indices relacionados con la configuración de la aventura
    props.setState<number>('WhereToPush',0,0);
    props.setState<number>('FaseConfigurable',0,0);
    props.setState<number>('FaseABorrar',0,0);

    //Me guardo las fases que acabamos de conseguir tras cargar la aventura
    props.setState('DATA',fases, []);

    //Esto nos lleva a la pantalla de resumen de fase
    props.jump(0);
}

const descargarAventura = async (indice: number)=>{
  let nombreAPK = aplicacionesDisponibles[indice];
  console.log("vamos a solicitar algo llamado "+nombreAPK);
  let aplicacion = await axios.get("./getAPK/"+nombreAPK, {responseType: 'arraybuffer',headers: {'Content-Type': 'application/json'},params: {json:"JSON.stringify(jsonFinal, null, 2)"}});
  const type = aplicacion.headers['content-type']
  const blob = new Blob([aplicacion.data], { type: type })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = nombreAPK;
  link.click();
  link.remove();
}



const guardarAPKHecha = async (e:React.ChangeEvent<HTMLInputElement>) => {  
  if (e.target.files?.item(0) instanceof File){
    setAplicacionSubida( e.target.files?.item(0) as File)
  }
  else setAplicacionSubida(null);
}

const mandarAplicacion = async() =>{
  //SI no tenemos una apk lista para subir no hacemos nada
  if(!(aplicacionSubida instanceof File)) return;

  let descripcionFinal ="";
  //En caso de que todo haya ido bien PERO el usuario no haya descrito su aventura le avisamos de esto porque es obligatorio para el servidor
  if(descripcionAventura===""){
    let noHayDescripcion = await Swal.fire({ icon: 'info', title: 'Alerta', 
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    text:  "Antes de guardar tu aventura debes de añadir una pequeña descripción sobre esta para que futuros jugadores sepan a qué van a jugar antes de descargarsela"
   });
   console.log(noHayDescripcion.value);
   if(noHayDescripcion.value === ""){
     let result = await Swal.fire({title: 'Guardado cancelado',text: "No se puede guardar una apk sin descripción", icon: 'error'});
     return;
   }
   descripcionFinal = noHayDescripcion.value;
  }


  //Si el nombre del APK que nos han dado ya se encuentra entre las APKs del server, preguntamos al jugador de si quiere sobreescribir la APK existente
  if(aplicacionesDisponibles.includes(aplicacionSubida.name) || true){
    let respuesta = await Swal.fire({ title: 'Alerta', text: "Ya existe una apk llamada "+aplicacionSubida.name+", ¿deseas sobreescribirla?", icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sobreescribir'
    });
    //En caso de que no quiera sobreescribir
    if(!respuesta.isConfirmed) return;
  }
  
  //Le pasamos al server el APK que el usuario ha dado
  const formData = new FormData();
  formData.append("apk", aplicacionSubida as File, aplicacionSubida?.name);
  let result = await axios.post('/apk-upload', formData);
  
  var jsonFinal = descripcionFinal;
  console.log("El nombre original es "+aplicacionSubida.name);
  console.log("El nombre cortado es  "+(aplicacionSubida.name).substring(0, (aplicacionSubida.name).indexOf('.')));
  console.log("Lo que voy a mandar es "+JSON.stringify({ json: jsonFinal , nombre: (aplicacionSubida.name).substring(0, (aplicacionSubida.name).indexOf('.'))}));
  let result2 = await axios.post("./wtf-descripcion", { json: jsonFinal , nombre: (aplicacionSubida.name).substring(0, (aplicacionSubida.name).indexOf('.'))});
}

const testSWAL = async () => {  
  // let noHayDescripcion = await swal("Alerta", {
  //   text:"Antes de guardar tu aventura debes de añadir una pequeña descripción sobre esta para que futuros jugadores sepan a qué van a jugar antes de descargarsela",
  //   icon: "info",  //success error info
  //   input: "text"
  // });
  let a = await Swal.fire({
    title: 'Sweet!',
    text: 'Modal with a custom image.',
    imageUrl: 'https://unsplash.it/400/200',
    imageWidth: 400,
    imageHeight: 200,
    imageAlt: 'Custom image',
  })

  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: 'Something went wrong!'
  })
}

  return (
    <div className = "App" >

    <button className="my-btn btn-outline-orange" style={{ fontSize: '170%' }} type="button" onClick={testSWAL}>  TEST  </button>
      <h1>Aplicaciones Hechas</h1>
      <h4>Guardar aventura en el servidor</h4>

      {/* Seccion descripción de la aventura */}
      {(aplicacionSubida!==null) && false ? 
            <div className="App" style={{display: 'flex', justifyContent: 'center', verticalAlign:'true'}}>
            <textarea style={{marginLeft:'0.5%' ,resize:"none", textAlign:"center"}} rows={3} cols={50} maxLength={100} onChange={(e) => {setDescripcionAventura(e.target.value)}} 
            placeholder="Describe aquí la aventura que vas a subir para que futuros usuarios puedan a qué van a jugar" 
                defaultValue={descripcionAventura}/>
            </div>
            : null }
      {/* Seccion descripción de la aventura */}

      <input style={{fontSize:'150%'}} type="file" onChange={guardarAPKHecha} />
      <button className="my-btn btn-outline-orange" style={{ fontSize: '170%' }} type="button" onClick={mandarAplicacion}>  Guardar  </button>

      <br></br>
      <br></br>

          <div >
              {
                //@ts-ignore 
                aplicacionesDisponibles.map((faseActual,ind) => (
                  <div>
              <AdventureCard aventura = {faseActual} descripcion={descripcionesAplicacionesDisponibles[ind]} funcionCargar={descargarAventura} index={ind}></AdventureCard>
              <br></br>
              </div>
            ))}
          </div>

          <h1>Aventuras disponibles para cargar</h1>
          <div >
              {
                //@ts-ignore 
                aventurasDisponibles.map((faseActual,ind) => (
                  <div>
              <AdventureCard aventura = {faseActual} descripcion={descripcionesAventurasDisponibles[ind]} funcionCargar={ponerACargar} index={ind}></AdventureCard>
              <br></br>
              </div>
            ))}
          </div>
      </div>
  );
};

export default AdventureCharger;