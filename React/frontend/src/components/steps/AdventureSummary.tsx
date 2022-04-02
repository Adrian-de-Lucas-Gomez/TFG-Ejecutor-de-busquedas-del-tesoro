import { StepComponentProps } from '../Steps';
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import axios from "axios"
import Prueba from './Prueba'

const AdventureSummary = (props: StepComponentProps): JSX.Element => {

    //Nada más empezar lo que hago es pedirle al server las aventuras que tenemos disponibles para cargar 
    useEffect(() => {
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, []);

  const configurarFase = (index:number)=>{
    //Preparamos las variables que las fases necesitan para que puedan obtener los datos necesarios
    props.setState('FaseConfigurable', index,0);
    props.setState<boolean>('SobreEscribir', true, true);

    let new_state = props.getState<any>('DATA', []);
    switch(new_state[index].tipo){
      case "QRStage":
        props.jump(2);
        break;
        case "QuizStage":
        props.jump(3);
        break;
        case "ImageStage":
          props.jump(4);
          break;
        case "ImageTargetStage":
          props.jump(5);
          break;
    }
  }

const eliminarFase = (e:number)=>{
    let new_state = props.getState<any>('DATA', []);
    new_state.splice(e,1);
    props.setState('DATA',new_state,[]);
    ComprobarIndicesFases();
}

  //este metodo tiene como objetivo comprobar que los indices de pusheo, reconfiguracion y borrado no se encuentran fuera de los límites del array de estados
  //para evitar que se trabajen con posiciones que no existen de este
  const ComprobarIndicesFases = () => {
    //Me hago tanto con el estado como con los indices 
    let estado = props.getState<any>('DATA', []);
    let indiceBorrar = props.getState<number>('FaseABorrar', 1);
    let indiceReconfigurar = props.getState<number>('FaseConfigurable', 1);
    let indicePushear = props.getState<number>('WhereToPush', 0) - 1;
    //Me encargo de que nadie este apuntando a una posicion invalida
    let tamaño = estado.length;
    if (indiceBorrar >= tamaño) indiceBorrar = tamaño - 1;
    if (indiceReconfigurar >= tamaño) indiceReconfigurar = tamaño - 1;
    if (indicePushear >= tamaño) indicePushear = tamaño - 1;
    //Guardo los posibles cambios que hayan pasado
    props.setState<number>('FaseABorrar', indiceBorrar, 0);
    props.setState<number>('FaseConfigurable', indiceReconfigurar, 0);
    props.setState<number>('WhereToPush', indicePushear, 0);
  }

 /*
    Metodo auxiliar para mandar distintos tipos de archivo al servidor. Tiene como parametros
  */
    const sendFileToServer = (identifier: string, file: File, fileName: string, route: string): void => {
        //Mandamos el archivo file al backend para que la trate de cara al proyecto
        //Creamos un FORMDATA que sera el que finalmente enviemos en la peticion POST
        const formData = new FormData();
        formData.append(identifier, file, fileName);
        //Hacemos una peticion POST a nuestro servidor a la route especificada
        axios.post(route, formData);
      }
    
      const mandarJson = async () => {
    
        console.log("Voy a intentar mandar el json");
        // //Una vez que tengo los datos de cada evento, preparo un JSON y lo descargo
        var datos = [];
        let f = props.getState<any>('DATA', []);
        let contadorImagenes = 0;
    
        for (let i = 0; i < f.length; i++) {
          var faseActual = f[i];
          //En caso de que sea una fase de tipo imagen
          if (faseActual.tipo === "ImageStage" && faseActual.Imagen instanceof File) {
            //El nombre de la imagen va a ser el orden de esta en la aventura mas su misma extension
            var finalImageName = faseActual.Imagen.name;
            finalImageName = (contadorImagenes.toString()) + (finalImageName.substring(finalImageName.indexOf('.')));
            //Cambiamos la fase para que el json tenga la referencia a esta
            faseActual = { tipo: "ImageStage", Imagen: finalImageName };
            contadorImagenes++;
          }
          else if (faseActual.tipo === "ImageTargetStage" && faseActual.Package instanceof File) {
    
            //Cambiamos la fase para que el json tenga la referencia a esta
            faseActual = { tipo: "ImageTargetStage", Key: faseActual.Key, Package: faseActual.Package.name, Target: faseActual.Target };
          }
          datos.push(faseActual);
        }
        var jsonFinal = { Gencana: props.getState('adventureName', "Nombre por defecto"), fases: datos }
    
        let result = await axios.post("./wtf-json", { json: JSON.stringify(jsonFinal, null, 2) });
        console.log("JSON MANDADO");
      }
    
      //Este método tiene como objetivo preparar cosas especificas de alguna fase, como por ejemplo mandar las imagenes 
      //al backend para que las trate en el proyecto y poder preparar el json de la aventura datos que nos ayuden recurrir a dichas
      //imagenes
      const operacionesPreDescargaProyecto = (): void => {
        console.log("Atencion operaciones antes de descargar el proyecto");
        //Tenemos que recorrer las posibles imagenes de la aventura y enviarlas al server para que haga algo con ellas
        var fasesAventura = props.getState<any>('DATA', []);;
        var contadorImagenes = 0
        for (var i = 0; i < fasesAventura.length; i++) {
    
          var faseActual = fasesAventura[i];
          if (faseActual.tipo === "ImageStage" && faseActual.Imagen instanceof File) {
            var finalImageName = faseActual.Imagen.name;
            finalImageName = (contadorImagenes.toString()) + (finalImageName.substring(finalImageName.indexOf('.')));
            console.log("El nombre de la imagen es " + finalImageName);
            sendFileToServer('imageCharger', faseActual.Imagen, finalImageName, "./image-upload")
            contadorImagenes++
          }
          else if (faseActual.tipo === "ImageTargetStage" && faseActual.Package instanceof File) {
            sendFileToServer('unityPackage', faseActual.Package, faseActual.Package.name, "./package-upload")
          }
        }
        props.setState('DATA', fasesAventura, []);
      }
    
    
    const salvarAventura = async () => {
      let nombreAventura = props.getState('adventureName', "Nombre por defecto");
      if(nombreAventura === "Nombre por defecto"){
        alert("Nombre de la aventura sin asignar");
        return;
      }

      let reset = await axios.get("./reset");
      await operacionesPreDescargaProyecto();
      await mandarJson();
      await axios.get("./guardame-aventura");
      console.log("Peticion mandada");
    }
    
    
      const generateZip = async () => {
        let nombreAventura = props.getState('adventureName', "Nombre por defecto");
        if(nombreAventura === "Nombre por defecto"){
          alert("Nombre de la aventura sin asignar");
          return;
        }
        let reset = await axios.get("./reset");
        //Mando los archivos que tenga, como las imagenes
        await operacionesPreDescargaProyecto();
        //Mando el json
        await mandarJson();
    
        //En este momento solo falta pedirle que me de un zip con todo lo que tenga
        let zip = await axios.get("./generate-zip", {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const type = zip.headers['content-type']
        const blob = new Blob([zip.data], { type: type })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = props.getState('adventureName', "Nombre por defecto") + '.zip';
        link.click();
        link.remove();
      }

      //Metodo que toma el texto que se esté escribiendo en el form para indicar el nombre que queremos que tenga la aventura y lo
      //guarda para que la futura aventura que vayamos a descargar tenga dicho nombre
      const modifyAdventureName = (e: string): void => {
        props.setState('adventureName', e, "Nombre por defecto");
      }

      const getAdventureName = (): string => {
        return props.getState('adventureName', "Nombre por defecto");
      }

  return (
    <div className = "App" >
        {/* Seccion que representa la parte superior del formulario que permite especificar qué nombre queremos que tenga la aventura 
        si no ponemos nada el nombre será el original del archivo que vayamos a descargar*/}
        <form style={{textAlign:'center', marginTop:'1%', fontSize:'120%'}} onSubmit={e => e.preventDefault()}>
          <input className='nameForm' type="text" value={getAdventureName()} placeholder="Nombre de aventura" maxLength={30} size={35} onChange={e => modifyAdventureName(e.target.value)}></input>
        </form>
        <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'250%'}} className="Titulo" >Fases actuales:</h3>
        {/* Conjunto de bloques que muestran las fases que tenemos disponibles */}
        {
        //@ts-ignore 
        props.getState<any>('DATA', []).map((faseActual,ind) => (
            <Prueba fase = {faseActual} funcionMofify={configurarFase} funcionDelete = {eliminarFase} index={ind} />          
        ))}

      {/* Este boton tiene como objetivo descargar el proyecto generado */}
      <div style={{marginTop:'2%'}}>
          <button className="my-btn btn-outline-orange" style={{fontSize:'170%'}} type="button" onClick={generateZip}>
            Generar Aventura
          </button>
          <button className="my-btn btn-outline-pink" style={{fontSize:'170%',marginLeft:'15%'}} type="button" onClick={salvarAventura}>
            Guardar Aventura
          </button>
      </div>
    </div>
  );
};

export default AdventureSummary;