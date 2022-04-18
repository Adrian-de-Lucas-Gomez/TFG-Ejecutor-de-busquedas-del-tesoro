import { StepComponentProps } from '../Steps';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import axios from "axios"
import PhaseCard from './PhaseCard';
import swal from "sweetalert";

const AdventureSummary = (props: StepComponentProps): JSX.Element => {

  //Nada más empezar lo que hago es pedirle al server las aventuras que tenemos disponibles para cargar 
  useEffect(() => {
    return () => { }
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, []);

  const configurarFase = (index: number) => {
    //Preparamos las variables que las fases necesitan para que puedan obtener los datos necesarios
    let new_state = props.getState<any>('DATA', []);
    props.setState('FaseConfigurable', index, 0);
    props.setState<boolean>('SobreEscribir', true, true);

    switch (new_state[index].tipo) {
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
      case "SoundStage":
        props.jump(6);
        break;
      case "InputTextStage":
        props.jump(7);
        break;
      case "GPSStage":
        props.jump(8);
        break;
    }
  }

  const eliminarFase = (e: number) => {
    let new_state = props.getState<any>('DATA', []);
    new_state.splice(e, 1);
    props.setState('DATA', new_state, []);
    ComprobarIndicesFases();
  }

  //este metodo tiene como objetivo comprobar que los indices de pusheo, reconfiguracion y borrado no se encuentran fuera de los límites del array de estados
  //para evitar que se trabajen con posiciones que no existen de este
  const ComprobarIndicesFases = () => {
    //Me hago tanto con el estado como con los indices 
    let estado = props.getState<any>('DATA', []);
    let indiceBorrar = props.getState<number>('FaseABorrar', 1);
    let indiceReconfigurar = props.getState<number>('FaseConfigurable', 1);
    let indicePushear = props.getState<number>('WhereToPush', 0);
    //Me encargo de que nadie este apuntando a una posicion invalida
    let tamaño = estado.length;
    if (indiceBorrar >= tamaño) indiceBorrar = tamaño - 1;
    if (indiceReconfigurar >= tamaño) indiceReconfigurar = tamaño - 1;
    if (indicePushear >= tamaño) indicePushear = tamaño;
    //Guardo los posibles cambios que hayan pasado
    props.setState<number>('FaseABorrar', indiceBorrar, 0);
    props.setState<number>('FaseConfigurable', indiceReconfigurar, 0);
    props.setState<number>('WhereToPush', indicePushear, 0);
  }

  /*
     Metodo auxiliar para mandar distintos tipos de archivo al servidor. Tiene como parametros
   */
  const sendFileToServer = async (identifier: string, file: File, fileName: string, route: string) => {
    //Mandamos el archivo file al backend para que la trate de cara al proyecto
    //Creamos un FORMDATA que sera el que finalmente enviemos en la peticion POST
    const formData = new FormData();
    formData.append(identifier, file, fileName);
    //Hacemos una peticion POST a nuestro servidor a la route especificada
    let result = await axios.post(route, formData);
    return result;
  }

  const mandarJson = async () => {

    console.log("Voy a intentar mandar el json");
    // //Una vez que tengo los datos de cada evento, preparo un JSON y lo descargo
    var datos = [];
    let f = props.getState<any>('DATA', []);
    let contadorImagenes = 0;
    let contadorTargets = 0;
    let contadorSonidos = 0;

    for (let i = 0; i < f.length; i++) {
      var faseActual = f[i];
      //En caso de que sea una fase de tipo imagen
      if (faseActual.tipo === "ImageStage" && faseActual.Imagen instanceof File) {
        //El nombre de la imagen va a ser el orden de esta en la aventura mas su misma extension
        var finalImageName = faseActual.Imagen.name;
        finalImageName = (contadorImagenes.toString()) + (finalImageName.substring(finalImageName.indexOf('.')));
        //Cambiamos la fase para que el json tenga la referencia a esta
        faseActual.Imagen = finalImageName;
        contadorImagenes++;
      }
      else if (faseActual.tipo === "ImageTargetStage" && faseActual.Target instanceof File) {
        var finalTargetName = faseActual.Target.name;
        finalTargetName = (contadorTargets.toString()) + (finalTargetName.substring(finalTargetName.indexOf('.')));
        //Cambiamos la fase para que el json tenga la referencia a esta
        faseActual.Target = finalTargetName;
        contadorTargets++;
      }
      else if (faseActual.tipo === "SoundStage" && faseActual.Sonido instanceof File) {
        var finalSoundName = faseActual.Sonido.name;
        finalSoundName = (contadorSonidos.toString()) + (finalSoundName.substring(finalSoundName.indexOf('.')));
        //Cambiamos la fase para que el json tenga la referencia a esta
        faseActual.Sonido = finalSoundName;
        contadorSonidos++;
      }
      datos.push(faseActual);
    }
    var jsonFinal = { Gencana: props.getState('adventureName', "Nombre por defecto"), VuforiaKey: props.getState('vuforiaKey', ''), fases: datos }

    let result = await axios.post("./wtf-json", { json: JSON.stringify(jsonFinal, null, 2) });
    console.log("JSON MANDADO");
  }

  //Este método tiene como objetivo preparar cosas especificas de alguna fase, como por ejemplo mandar las imagenes 
  //al backend para que las trate en el proyecto y poder preparar el json de la aventura datos que nos ayuden recurrir a dichas
  //imagenes
  const operacionesPreDescargaProyecto = async () => {
    console.log("Atencion operaciones antes de descargar el proyecto");
    //Tenemos que recorrer las posibles imagenes de la aventura y enviarlas al server para que haga algo con ellas
    var fasesAventura = props.getState<any>('DATA', []);
    var contadorImagenes = 0;
    var contadorTargets = 0;
    var contadorSonidos = 0;
    for (var i = 0; i < fasesAventura.length; i++) {

      var faseActual = fasesAventura[i];
      if (faseActual.tipo === "ImageStage" && faseActual.Imagen instanceof File) {
        var finalImageName = faseActual.Imagen.name;
        finalImageName = (contadorImagenes.toString()) + (finalImageName.substring(finalImageName.indexOf('.')));
        console.log("El nombre de la imagen es " + finalImageName);
        let result = await sendFileToServer('imageCharger', faseActual.Imagen, finalImageName, "./image-upload")
        contadorImagenes++
      }
      else if (faseActual.tipo === "ImageTargetStage" && faseActual.Target instanceof File) {
        var finalTargetName = faseActual.Target.name;
        finalTargetName = (contadorTargets.toString()) + (finalTargetName.substring(finalTargetName.indexOf('.')));
        let result = await sendFileToServer('unityPackage', faseActual.Target, finalTargetName, "./package-upload")
        contadorTargets++;
      }
      else if (faseActual.tipo === "SoundStage" && faseActual.Sonido instanceof File) {
        var finalSoundName = faseActual.Sonido.name;
        finalSoundName = (contadorSonidos.toString()) + (finalSoundName.substring(finalSoundName.indexOf('.')));
        let result = await sendFileToServer('sound', faseActual.Sonido, finalSoundName, "./sound-upload")
        contadorSonidos++;
      }
    }
    props.setState('DATA', fasesAventura, []);
  }

  //Metodo que comprueba si la key de vuforia es correcta
  //En caso de que no haya fases de AR o que si que las haya y la key tenga el numero de caracteres
  //requeridos devuelve true
  //en caso contrario devuelve false
  const checkVuforiaKey = (): boolean => {
    //En caso de que tengamos problemas con la clave de vuforia avisamos al usuario de esto
    let vuforiaKey = props.getState('vuforiaKey', '');
    var fasesAventura = props.getState<any>('DATA', []);
    let vuforiaKeyRequired = false;
    var i = 0;

    while (i < fasesAventura.length && !vuforiaKeyRequired) {
      var faseActual = fasesAventura[i];
      if (faseActual.tipo === "ImageTargetStage") {
        vuforiaKeyRequired = true;
        break;
      }
      i++;
    }

    if (vuforiaKeyRequired && vuforiaKey.length !== 380) {
      return false;
    }

    return true;
  }

  const salvarAventura = async () => {
    //En caso de que tengamos problemas con el nombre del proyecto avisamos al usuario de esto
    let nombreAventura = props.getState('adventureName', "Nombre por defecto");
    if (nombreAventura === "Nombre por defecto") {
      let respuesta = await swal({ title: "Nombre de la aventura sin asignar", text: "Ponle un nombre a tu aventura para poder generar el proyecto", icon: "error" });
      return;
    }

    //En caso de que tengamos problemas con la clave de vuforia avisamos al usuario de esto
    if (!checkVuforiaKey()) {
      let respuesta = await swal({ title: "Clave de Vuforia incorrecta", text: "Inserte una clave de Vuforia válida para generar el proyecto", icon: "error" });
      return;
    }

    //En caso de que le nombre de la aventura que pretendemos guardar de problemas avisamos al usuario de si quiere sobreescribir la ya existente
    let guardadasEnElServer = await axios.get("./aventuras-guardadas");
    if (guardadasEnElServer.data.Opciones.includes(nombreAventura)) {
      let respuesta = await swal({ title: nombreAventura + " ya existe", text: "Ya existe una aventura guardada con el nombre " + nombreAventura + " en el servidor.¿Deseas sobreescribirla?", icon: "info", buttons: ["Cancelar", "Sobreescribir"] });
      //Si el usuario no desea sobreescribir la aventura dejamos de hacer cosas
      if (!respuesta) return;
    }

    //Si no nos hemos ido del metodo lo que nos queda por hacer es limpiar el server, mandar todos los ficheros que componen nuestra aventura y solicitar el proyecto
    let reset = await axios.get("./reset");
    await operacionesPreDescargaProyecto();
    await mandarJson();
    await axios.get("./guardame-aventura");

    swal({ title: "Aventura guardada", icon: "success" });
  }


  const generateZip = async () => {
    //En caso de que la aventura todavia tenga el nombre por defecto avisamos al usuario de que esto debe de cambiarlo
    let nombreAventura = props.getState('adventureName', "Nombre por defecto");
    if (nombreAventura === "Nombre por defecto") {
      let respuesta = await swal({ title: "Nombre de la aventura sin asignar", text: "Ponle un nombre a tu aventura para poder generar el proyecto", icon: "error" });
      return;
    }

    //En caso de que tengamos problemas con la clave de vuforia avisamos al usuario de esto
    if (!checkVuforiaKey()) {
      let respuesta = await swal({ title: "Clave de Vuforia incorrecta", text: "Inserte una clave de Vuforia válida para generar el proyecto", icon: "error" });
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

  const getVuforiaKey = (): string => {
    return props.getState('vuforiaKey', "");
  }
  const modifyVuforiaKey = (e: string): void => {
    props.setState('vuforiaKey', e, "");
  }
  //Metodo que toma una posicion dentro del array de fases y una direccion y mueve la fase que se encuentre en dicha posicion hacia
  //la dirección especificada si es posible
  const moverFase = (index: number, dir: number): void => {
    let fases = props.getState<any>('DATA', []);
    //Subimos la fase
    let dest = 0;
    if (dir === -1) {
      dest = index - 1;
      if (dest < 0) dest = 0;
    }
    else if (dir === 1) {
      dest = index + 1;
      if (dest === fases.length)
        dest = fases.length - 1;
    }

    //Si no la hemos podido mover nos salimos
    if (dest === index) return;

    //Quito el elemento y lo pongo en una nueva posicion
    var element = fases[index];
    fases.splice(index, 1);
    fases.splice(dest, 0, element);

    props.setState('DATA', fases, []);
  }


  return (
    <div >
      {/* Seccion que representa la parte superior del formulario que permite especificar qué nombre queremos que tenga la aventura 
        si no ponemos nada el nombre será el original del archivo que vayamos a descargar*/}
      <form style={{ textAlign: 'center', marginTop: '1%', fontSize: '120%' }} onSubmit={e => e.preventDefault()}>
        <input className='nameForm' type="text" value={getAdventureName()} placeholder="Nombre de aventura" maxLength={30} size={35} onChange={e => modifyAdventureName(e.target.value)}></input>
      </form>
      {/* Sección para introducir la key de vuforia necesaria para las fases que requieran de realidad aumentada*/}
      <form style={{ textAlign: 'center', marginTop: '1%', fontSize: '120%' }} onSubmit={e => e.preventDefault()}>
        <input className='nameForm' type="text" value={getVuforiaKey()} placeholder="Key de Vuforia" maxLength={380} size={35} onChange={e => modifyVuforiaKey(e.target.value)}></input>
      </form>
      <h3 style={{ marginTop: '0.5%', marginBottom: '1%', fontSize: '250%' }} className="Titulo" >Fases actuales:</h3>
      {/* Conjunto de bloques que muestran las fases que tenemos disponibles */}

      {
        //@ts-ignore 
        props.getState<any>('DATA', []).map((faseActual, ind) => (
          <div>
            <PhaseCard fase={faseActual} funcionMofify={configurarFase} funcionDelete={eliminarFase} funcionMover={moverFase} index={ind} ></PhaseCard>
            <br></br>
          </div>
          // <CartaFase fase = {faseActual} funcionMofify={configurarFase} funcionDelete = {eliminarFase} funcionMover={moverFase} index={ind} />          
        ))}

      {/* Este boton tiene como objetivo descargar el proyecto generado */}
      <div className="center" style={{ marginTop: '2%' }}>
        <button className="my-btn btn-outline-orange" style={{ fontSize: '170%' }} type="button" onClick={generateZip}>
          Generar Aventura
        </button>
        <button className="my-btn btn-outline-pink" style={{ fontSize: '170%', marginLeft: '15%' }} type="button" onClick={salvarAventura}>
          Guardar Aventura
        </button>
      </div>
    </div>
  );
};

export default AdventureSummary;