import { StepComponentProps } from '../Steps';
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import axios from "axios"
import AdventureCard from "./AdventureCard"
import swal from "sweetalert";


const AdventureCharger = (props: StepComponentProps): JSX.Element => {

    //Indice de la aventtra que estamos seleccionando
    const [indiceAventura, setIndiceAventura] = useState<number>(0);
    //Lista de las aventuras que el server nos ha informado que existen y que podemos seleccionar y cargar
    const [aventurasDisponibles, setAventurasDisponibles] = useState<any>([]);
    const [aplicacionesDisponibles, setAplicacionesDisponibles] = useState<any>([]);


    const [aplicacionSubida, setAplicacionSubida]= useState<File | null >(null);

    //Nada más empezar lo que hago es pedirle al server las aventuras que tenemos disponibles para cargar 
    useEffect(() => {
      axios.get("./aventuras-guardadas").then (response => {
        //Seteamos las aventuras que tenemos disponibles a lo que nos ha dicho el server
        console.log("Las opciones son "+response.data.Opciones);
        setAventurasDisponibles(response.data.Opciones);
        //Ponemos el texto a una cosa u otra para informar al jugador de lo que se está seleccionando
        if(response.data.Opciones.length < 1){}
        else {
          setIndiceAventura(0);
        }})

        axios.get("./aplicacionesListas-guardadas").then (response => {
          //Seteamos las aventuras que tenemos disponibles a lo que nos ha dicho el server
          console.log("Las APKs son "+response.data.Opciones);
          setAplicacionesDisponibles(response.data.Opciones);
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

//Métodos para alterar el índice de selección de aventura
  const aumentarIndice = ():void =>{    
    var result = indiceAventura;
    result++;
    if(result >= aventurasDisponibles.length) result = aventurasDisponibles.length-1;
    if(result <0) result = 0;    
    setIndiceAventura(result);
    console.log("La aventura a la que apuntamos ahora es "+aventurasDisponibles[result]);
  } 
  const disminuirIndice = ():void =>{    
    var result = indiceAventura;
    result--;
    if(result < 0) result = 0;    
    setIndiceAventura(result);
    console.log("La aventura a la que apuntamos ahora es "+aventurasDisponibles[result]);
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

  //Si el nombre del APK que nos han dado ya se encuentra entre las APKs del server, preguntamos al jugador de si quiere sobreescribir la APK existente
  if(aplicacionesDisponibles.includes(aplicacionSubida.name)){
    let respuesta = await swal("Alerta", {
      text:"Ya existe una apk llamada "+aplicacionSubida.name+", ¿deseas sobreescribirla?",
      icon: "info",  //success error info
      buttons: ["Cancelar","Sobreescribir"]
    });
    //En caso de que no quiera sobreescribir
    if(!respuesta) return;
  }
  //Le pasamos al server el APK que el usuario ha dado
  const formData = new FormData();
  formData.append("apk", aplicacionSubida as File, aplicacionSubida?.name);
  let result = await axios.post('/apk-upload', formData);
}

  return (
    <div className = "App" >
      <h1>Aplicaciones Hechas</h1>
      <h4>Guardar aventura en el servidor</h4>
      <input style={{fontSize:'150%'}} type="file" onChange={guardarAPKHecha} />
      <button className="my-btn btn-outline-orange" style={{ fontSize: '170%' }} type="button" onClick={mandarAplicacion}>  Guardar  </button>

      <br></br>
      <br></br>


        <div >
            {
          //@ts-ignore 
          aplicacionesDisponibles.map((faseActual,ind) => (
            <div>
            <AdventureCard aventura = {faseActual} funcionCargar={descargarAventura} index={ind}></AdventureCard>
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
            <AdventureCard aventura = {faseActual} funcionCargar={ponerACargar} index={ind}></AdventureCard>
            <br></br>
            </div>
          ))}
        </div>
      </div>
  );
};

export default AdventureCharger;