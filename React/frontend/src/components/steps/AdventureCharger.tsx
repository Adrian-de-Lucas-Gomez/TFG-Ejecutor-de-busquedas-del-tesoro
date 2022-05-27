import { StepComponentProps } from '../Steps';
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import axios from "axios"
import AdventureCard from "./AdventureCard"
import Swal from 'sweetalert2'


const AdventureCharger = (props: StepComponentProps): JSX.Element => {

    //Lista de las aventuras que el server nos ha informado que existen y que podemos seleccionar y cargar
    const [aventurasDisponibles, setAventurasDisponibles] = useState<any>([]);
    const [descripcionesAventurasDisponibles, setDescripcionesAventurasDisponibles] = useState<any>([]);

    //Lista de aplicaciones almacenadas en el servidor que podemos descargar y lista de descripciones de las mismas
    const [aplicacionesDisponibles, setAplicacionesDisponibles] = useState<any>([]);
    const [descripcionesAplicacionesDisponibles, setDescripcionesAplicacionesDisponibles] = useState<any>([]);


    //Estados encargados de tratar la aplicacion que el usuario puede subir al servidor para su almacenamiento junto a su descripción
    const [aplicacionSubida, setAplicacionSubida]= useState<File | null >(null);
    const [descripcionAventura, setDescripcionAventura] = useState<string >("");

    //estado utilizado para actualizar la pagina cuando se guarda una aplicacion en el servidor y que se muestre que se encuentra entre las disponibles
    const [refresh , setRefresh] = useState<boolean >(false);

    //Nada más empezar lo que hago es pedirle al server las aventuras que tenemos disponibles para cargar 
    useEffect(() => {

      //Obtenemos las configuraciones disponibles y las descripciones de las mismas
      axios.get("./aventuras-guardadas").then (response => {
        //Seteamos las aventuras que tenemos disponibles a lo que nos ha dicho el server
        setAventurasDisponibles(response.data.Opciones);
        setDescripcionesAventurasDisponibles(response.data.Descripciones);
      })

      //Obtenemos las aplicaciones guardadas y las descripciones de las mismas
      axios.get("./aplicacionesListas-guardadas").then (response => {
        //Seteamos las aventuras que tenemos disponibles a lo que nos ha dicho el server
        setAplicacionesDisponibles(response.data.Opciones);
        setDescripcionesAplicacionesDisponibles(response.data.Descripciones);
      })

        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [refresh]);


  //Metodo llamado por las cartas que representan las configuraciones del servidor, recibe un indice indicando cual de todas se ha pulsado
  //El objetivo de este método es cargar la configuración de dicha aventura con su JSON y los archivos adicionales involucrados
  const ponerACargar = async (index:number)=>{
    if(aventurasDisponibles.length <1 ){
      alert("No hay aventuras disponibles"); 
      return;
    }
    //Le pido al server una aventura con un nombre que se le indica, y cuando nos llegue la cargamos en nuestro estado global de react
    var jsonFinal = {Nombre: aventurasDisponibles[index] }

    Swal.showLoading();
    //Solicito el json de la aventura en cuestion
    const response = await axios.post("./dame-aventura", {json:JSON.stringify(jsonFinal, null, 2)});
    var nombreDeLaAventura = JSON.parse(response.data.AventuraGuardada).Adventure
    props.setState('adventureName',nombreDeLaAventura, "Nombre por defecto");

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

        let reset = await axios.get("./getFile/"+fileName+"/"+nombreDeLaAventura, {responseType: 'arraybuffer',headers: {'Content-Type': 'application/json'},params: {json:"JSON.stringify(jsonFinal, null, 2)"}});
        const type = reset.headers['content-type']
        const blob = new Blob([reset.data], { type: type })

        let myData = faseActual;
        if(faseActual.tipo === "ImageStage")              myData.Imagen= new File([blob], fileName);
        else if(faseActual.tipo === "SoundStage")         myData.Sonido= new File([blob], fileName);
        else if(faseActual.tipo === "ImageTargetStage"){   
          myData.Target = new File([blob], fileName);

          //SI es un image target con imagen secundaria hay que encima pedir dicha imagen secundaria
          if(myData.TargetType === "Image"){
            fileName=faseActual.OverlappingImage;
            let reset = await axios.get("./getFile/"+fileName+"/"+nombreDeLaAventura, {responseType: 'arraybuffer',headers: {'Content-Type': 'application/json'},params: {json:"JSON.stringify(jsonFinal, null, 2)"}});
            const type = reset.headers['content-type']
            const blob = new Blob([reset.data], { type: type })
            myData.OverlappingImage = new File([blob], fileName);
          }
        }
        fases.splice(i,1,myData);
      }
  }

    Swal.fire({title: 'Aventura cargada', icon: 'success'});
    //Como hemos cargado cosas vamos a resetear los indices relacionados con la configuración de la aventura
    props.setState<number>('WhereToPush',0,0);
    props.setState<number>('FaseConfigurable',0,0);
    props.setState<number>('FaseABorrar',0,0);

    //Me guardo las fases que acabamos de conseguir tras cargar la aventura
    props.setState('DATA',fases, []);

    //Esto nos lleva a la pantalla de resumen de fase
    props.jump(0);
}

//Metodo llamado por las cartas que representan las aplicacions almacenadas en el servidor, recibe un indice indicando cual de todas se ha pulsado
const descargarAventura = async (indice: number)=>{

  Swal.showLoading();
  //Se solicita una aplicacion llamada como la que tarjeta nos haya indicado
  let nombreAPK = aplicacionesDisponibles[indice];
  let aplicacion = await axios.get("./getAPK/"+nombreAPK, {responseType: 'arraybuffer',headers: {'Content-Type': 'application/json'},params: {json:"JSON.stringify(jsonFinal, null, 2)"}});
 
  //Se toma la respuesta del servidor y se descarga la aplicación que viene en ella
  const type = aplicacion.headers['content-type']
  const blob = new Blob([aplicacion.data], { type: type })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = nombreAPK;
  link.click();
  link.remove();
  Swal.fire({title: 'Aplicación descargada', icon: 'success'});
}



  //Metodo que se llama cuando el usuario carga una aplicación 
  //Comprueba que se puede cargar y en caso contrario le avisa al usuario de que hay un problema
const guardarAPKHecha = async (e:React.ChangeEvent<HTMLInputElement>) => {  
  if (e.target.files?.item(0) instanceof File){
    let file: File | null = e.target.files?.item(0);
    let name: string = file?.name as string;
    let filename: string[] = name.split('.') as string[]
    let extension: string = filename[filename?.length - 1]
    if(extension == 'apk'){
      setAplicacionSubida(file)
    } 
    else{
      e.target.value = "";
      Swal.fire({title: 'No se ha podido cargar el archivo',text: "El archivo debe tener extensión .apk", icon: 'warning'});
      setAplicacionSubida(null);
    }
  }
  else setAplicacionSubida(null);
}

//Metodo que se utiliza para mandar una aplicación cargada por el usuario para su almacenamiento en el servidor
//Antes de hacer este envío se le solicita al usuario que de una descripción sobre la aventura que quiere guardar
//Cuando la rellene se envía la aplicación, en caso de no hacerlo se cancela la operación
const mandarAplicacion = async() =>{

  //SI no tenemos una apk lista para subir no hacemos nada
  if(!(aplicacionSubida instanceof File)) return;
  let filename: string[] = aplicacionSubida.name.split('.') as string[]
  //Si el nombre del APK que nos han dado ya se encuentra entre las APKs del server, preguntamos al jugador de si quiere sobreescribir la APK existente
  if(aplicacionesDisponibles.includes(filename[0])){
    let respuesta = await Swal.fire({ title: 'Alerta', text: "Ya existe una apk llamada "+filename[0]+", ¿deseas sobreescribirla?", icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sobreescribir'
    });
    //En caso de que no quiera sobreescribir
    if(!respuesta.isConfirmed) return;
  }

  let descripcionFinal ="";
  //En caso de que todo haya ido bien PERO el usuario no haya descrito su aventura le avisamos de esto porque es obligatorio para el servidor
  if(descripcionAventura===""){
    let noHayDescripcion = await Swal.fire({ icon: 'info', title: 'Alerta', 
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    allowOutsideClick: false,
    allowEscapeKey: false,
    text:  "Antes de guardar tu aventura debes de añadir una pequeña descripción sobre esta para que futuros jugadores sepan a qué van a jugar antes de descargarsela"
   });
   console.log(noHayDescripcion.value);
   if(noHayDescripcion.value === ""){
     let result = await Swal.fire({title: 'Guardado cancelado',text: "No se puede guardar una apk sin descripción", icon: 'error'});
     return;
   }
   descripcionFinal = noHayDescripcion.value;
  }
  
  Swal.showLoading();
  //Le pasamos al server el APK que el usuario ha dado
  const formData = new FormData();
  formData.append("apk", aplicacionSubida as File, aplicacionSubida?.name);
  let result = await axios.post('/apk-upload', formData);  
  var jsonFinal = descripcionFinal;
  try{
    let result2 = await axios.post("./guardame-APK", { description: jsonFinal , nombre: (aplicacionSubida.name).substring(0, (aplicacionSubida.name).indexOf('.'))});
  }
  catch(e){
    console.log((e as Error).message)
    Swal.fire({title: 'APK no guardada',text: "El archivo no se ha podido almacenar en el servidor", icon: 'error'});
  }
  
  Swal.fire({title: 'Aplicación guardada',text: "El archivo ha sido almacenado en el servidor", icon: 'success'});
  setRefresh(!refresh);
}

  return (
    <div className = "App" id='id0'>

      <h2 style={{color:"white", fontSize:"200%"}}>Guardar aventura en el servidor</h2>

      {/* Seccion descripción de la aventura */}
      {(aplicacionSubida!==null) && false ? 
            <div className="App" style={{display: 'flex', justifyContent: 'center', verticalAlign:'true'}}>
            <textarea style={{marginLeft:'0.5%' ,resize:"none", textAlign:"center"}} rows={3} cols={50} maxLength={100} onChange={(e) => {setDescripcionAventura(e.target.value)}} 
            placeholder="Describe aquí la aventura que vas a subir para que futuros usuarios puedan a qué van a jugar" 
                defaultValue={descripcionAventura}/>
            </div>
            : null }
      {/* Seccion descripción de la aventura */}

      <input style={{fontSize:'150%', color:"white"}} type="file" onChange={guardarAPKHecha} />
      <button className="my-btn btn-outline-dark" style={{ fontSize: '170%', marginLeft:'1%' }} type="button" onClick={mandarAplicacion}>  Guardar  </button>

      <br></br>
      <br></br>

      <h1 style={{color:"white"}}>Aplicaciones disponibles para jugar</h1>

      <div>
          {
            //@ts-ignore 
            aplicacionesDisponibles.map((faseActual,ind) => (
              <div>
          <AdventureCard aventura = {faseActual} descripcion={descripcionesAplicacionesDisponibles[ind]} textoBoton={"Descargar APK"} funcionCargar={descargarAventura} index={ind}></AdventureCard>
          <br></br>
          </div>
        ))}
      </div>

      <h1 style={{color:"white"}}>Aventuras disponibles para cargar</h1>
      <div >
          {
            //@ts-ignore 
            aventurasDisponibles.map((faseActual,ind) => (
              <div>
          <AdventureCard aventura = {faseActual} descripcion={descripcionesAventurasDisponibles[ind]} textoBoton={"Cargar Aventura"} funcionCargar={ponerACargar} index={ind}></AdventureCard>
          <br></br>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdventureCharger;