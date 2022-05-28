import { StepComponentProps } from '../Steps';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import axios from "axios"
import PhaseCard from './PhaseCard';
import swal from "sweetalert";
import Swal from "sweetalert2"


const AdventureSummary = (props: StepComponentProps): JSX.Element => {

  //Nada más empezar lo que hago es pedirle al server las aventuras que tenemos disponibles para cargar 
  useEffect(() => {
    return () => { }
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, []);


  //Metodo llamado por las cartas que representan las fases de la aventura, ocurre cuando se ha pulsado el boton de hacer cambios en una de estas fases
  //Se mira cual ha sido la carta que ha llamado este metodo a traves del indice recibido y se salta al formulario que permita configurar la fase que representa
  //dicha carta
  const configurarFase = (index: number) => {
    //Preparamos las variables que las fases necesitan para que puedan obtener los datos necesarios
    let new_state = props.getState<any>('DATA', []);
    props.setState('FaseConfigurable', index, 0);
    props.setState<boolean>('SobreEscribir', true, true);

    //Saltamos al formulario que haga falta
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

  //Metodo llamado por las cartas que representan las fases de la aventura para eliminar una fase concreta
  //Se recibe el indice de la carta que ha llamado a este metodo para determinar qué fase eliminar
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

//MEtodo llamado por las cartas que representan las fases de la aventura para cambiar una de posición
  //Recibe un indice para indicar qué fase se quiere mover y la dirección en la que se quiere hacer
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

    //Actualizo el estado de las fases de la aventura
    props.setState('DATA', fases, []);
  }



  /*
     Metodo auxiliar para mandar distintos tipos de archivo al servidor. Tiene como parametros 
     el archivo a mandar
     la ruta a la que hacerlo
     el nomber que se le quiere dar a dicho fichero 
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

  //MEtodo utilizado para enviar el json con los datos de la aventura al servidor
  const mandarJson = async () => {
    // //Una vez que tengo los datos de cada evento, preparo un JSON y lo descargo
    var datos = [];
    let fasesDeLaAventura = props.getState<any>('DATA', []);      
    //"Deep copy" de las fases de la aventura que pierde los archivos por el stringlify
    //esta copia es necesaria porque fasesDeLaAventura es una referencia y si a la hora de preparar el json a mandar 
    //quitamos los archivos estos tambien se perderan del "STATE"                
    let copiaFasesAventuraSinArchivos = JSON.parse(JSON.stringify(fasesDeLaAventura));

    //Contadores que voy atilizar para poner los nombres de cada uno de los archivos en el json a mandar
    let contadorImagenes = 0;
    let contadorTargets = 0;
    let contadorSonidos = 0;

    for (let i = 0; i < copiaFasesAventuraSinArchivos.length; i++) {
      var faseActual = copiaFasesAventuraSinArchivos[i];
      //En caso de que sea una fase de tipo imagen
      if (fasesDeLaAventura[i].tipo === "ImageStage" && fasesDeLaAventura[i].Imagen instanceof File) {
        //El nombre de la imagen va a ser el orden de esta en la aventura mas su misma extension
        var finalImageName = fasesDeLaAventura[i].Imagen.name;
        finalImageName = (contadorImagenes.toString()) + (finalImageName.substring(finalImageName.indexOf('.')));
        //Cambiamos la fase para que el json tenga la referencia a la imagen de la fase
        faseActual.Imagen = finalImageName;
        contadorImagenes++;
      }
      //En caso de que sea una fase de tipo Image Target
      else if (fasesDeLaAventura[i].tipo === "ImageTargetStage" && fasesDeLaAventura[i].Target instanceof File) {
        var finalTargetName = fasesDeLaAventura[i].Target.name;
        finalTargetName = (contadorTargets.toString())+"RA" + (finalTargetName.substring(finalTargetName.indexOf('.')));
        //Cambiamos la fase para que el json tenga la referencia a la imagene involucrada
        faseActual.Target = finalTargetName;

        //Si se va a superponet otra imagen sobre el target se hace lo mismo con dicha imagen
        if (fasesDeLaAventura[i].TargetType === "Image" && fasesDeLaAventura[i].OverlappingImage instanceof File) {
          faseActual.OverlappingImage = contadorTargets.toString() + "_overlapping.png";
        }
        contadorTargets++;
      }
      //En caso de que sea una fase de tipo Sonido
      else if (fasesDeLaAventura[i].tipo === "SoundStage" && fasesDeLaAventura[i].Sonido instanceof File) {
        var finalSoundName = fasesDeLaAventura[i].Sonido.name;
        finalSoundName = (contadorSonidos.toString()) + (finalSoundName.substring(finalSoundName.indexOf('.')));
        //Cambiamos la fase para que el json tenga la referencia a esta
        faseActual.Sonido = finalSoundName;
        contadorSonidos++;
      }
      datos.push(faseActual);
    }
    var jsonFinal = { Adventure: props.getState('adventureName', "Nombre por defecto"), VuforiaKey: props.getState('vuforiaKey', ''), fases: datos }
    let result = await axios.post("./guardame-json", { json: JSON.stringify(jsonFinal, null, 2) });
  }

  //Este método tiene como objetivo madar todos los archivos involucrados en la aventura que no sean el JSON, como las imagenes o los audios de determinadas fases
  //Adicionalmente se cambia le nombre de estos ficheros para evitar colisiones de nombres en el servidor
  //La manera en la que se renombrean estos ficheros es utilizando indices para cada tipo de fase, adicionalmente en las fases de imagetarget se añaden sufijos al indice
  const operacionesPreDescargaProyecto = async () => {
    //Tenemos que recorrer las posibles imagenes de la aventura y enviarlas al server para que haga algo con ellas
    var fasesAventura = props.getState<any>('DATA', []);
    var contadorImagenes = 0;
    var contadorTargets = 0;
    var contadorSonidos = 0;
    for (var i = 0; i < fasesAventura.length; i++) {

      //Se mandan los ficheros de las fases de imagen
      var faseActual = fasesAventura[i];
      if (faseActual.tipo === "ImageStage" && faseActual.Imagen instanceof File) {
        var finalImageName = faseActual.Imagen.name;
        finalImageName = (contadorImagenes.toString()) + (finalImageName.substring(finalImageName.indexOf('.')));

        let result = await sendFileToServer('imageCharger', faseActual.Imagen, finalImageName, "./image-upload")
        contadorImagenes++
      }

      //Se mandan los ficheros de las fases de image target
      else if (faseActual.tipo === "ImageTargetStage" && faseActual.Target instanceof File) {
        var finalTargetName = faseActual.Target.name;
        finalTargetName = (contadorTargets.toString())+ "RA" + (finalTargetName.substring(finalTargetName.indexOf('.')));
        let result = await sendFileToServer('unityPackage', faseActual.Target, finalTargetName, "./package-upload")

        if (faseActual.TargetType === "Image" && faseActual.OverlappingImage instanceof File) {
          result = await sendFileToServer("overlap", faseActual.OverlappingImage, contadorTargets.toString() + "_overlapping.png", "./overlapping_upload")
        }
        contadorTargets++;
      }

      //Se mandan los ficheros de las fases de sonido
      else if (faseActual.tipo === "SoundStage" && faseActual.Sonido instanceof File) {
        var finalSoundName = faseActual.Sonido.name;
        finalSoundName = (contadorSonidos.toString()) + (finalSoundName.substring(finalSoundName.indexOf('.')));

        let result = await sendFileToServer('sound', faseActual.Sonido, finalSoundName, "./sound-upload")
        contadorSonidos++;
      }
    }
  }

  //Metodo que comprueba si la key de vuforia necesaria y además correcta
  //En caso de que no haya fases de AR o que si que las haya y la key tenga el numero de caracteres
  //requeridos devuelve true
  //en caso contrario devuelve false
  const checkVuforiaKey = async ()  => {
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
      let respuesta = await Swal.fire({title: "Nombre de la aventura sin asignar",text: "Ponle un nombre a tu aventura para poder generar el proyecto", icon: 'error'});
      return;
    }

    //Se comprueba que no se está tratando con una aventura vacía
    let fases = props.getState<any>('DATA', []);
    if(fases.length === 0){
      let respuesta = await Swal.fire({icon: 'error', title: 'Aventura vacía', text: "No se puede guardar una aventura que no tenga ninguna fase.", allowEscapeKey: false, allowOutsideClick: false});
      return;
    }


    //En caso de que tengamos problemas con la clave de vuforia avisamos al usuario de esto
    let keyVuforiaValida = await checkVuforiaKey();
    if (keyVuforiaValida !== true) {
      let respuesta = await Swal.fire({title: "Clave de Vuforia incorrecta",text: "Inserte una clave de Vuforia válida para generar el proyecto", icon: 'error'});
      return;
    }

    //En caso de que le nombre de la aventura que pretendemos guardar de problemas avisamos al usuario de si quiere sobreescribir la ya existente
    let guardadasEnElServer = await axios.get("./aventuras-guardadas");
    if (guardadasEnElServer.data.Opciones.includes(nombreAventura)) {
      let respuesta = await Swal.fire({ title: nombreAventura + " ya existe", text: "Ya existe una aventura guardada con el nombre " + nombreAventura + " en el servidor.¿Deseas sobreescribirla?", icon: 'info',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sobreescribir',
      allowOutsideClick: false,
      allowEscapeKey: false

    });
      //Si el usuario no desea sobreescribir la aventura dejamos de hacer cosas
      if (!respuesta.isConfirmed) return;
    }


    //En caso de que todo haya ido bien PERO el usuario no haya descrito su aventura le avisamos de esto porque es obligatorio para el servidor
    let descripcionFinal ="";
    let noHayDescripcion = await Swal.fire({ icon: 'info', title: 'Alerta', 
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    allowOutsideClick: false,
    allowEscapeKey: false,
    text:  "Antes de guardar tu aventura debes de añadir una pequeña descripción sobre esta para que futuros jugadores sepan a qué van a jugar antes de descargarsela"
    });
    //Si aun avisandole no me ha dado ninguna descripcion cancelamos toda la operacion
    if(noHayDescripcion.value === ""){
      let result = await Swal.fire({title: 'Guardado cancelado',text: "No se puede guardar una apk sin descripción", icon: 'error'});
      return;
    }
    descripcionFinal = noHayDescripcion.value;

  
    //Se muestra una alerta indicando que se está intentando guardar la aventura en el servidor
    Swal.fire({
      title: 'Guardando configuración en el servidor',
      html: 'Este proceso puede tardar un poco...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });


    //Si no nos hemos ido del metodo lo que nos queda por hacer es limpiar el server, mandar todos los ficheros que componen nuestra aventura y solicitar el proyecto
    let reset = await axios.get("./reset");
    await operacionesPreDescargaProyecto();
    await mandarJson();
    await axios.post("./guardame-aventura", { descripcion: descripcionFinal, nombre: nombreAventura });    
    Swal.fire({icon: 'success', title: 'Aventura guardada', text: "La configuración de su aventura se ha almacenado en el servidor.", allowEscapeKey: false, allowOutsideClick: false})
  }


  const generateZip = async () => {

    //En caso de que la aventura todavia tenga el nombre por defecto avisamos al usuario de que esto debe de cambiarlo
    let nombreAventura = props.getState('adventureName', "Nombre por defecto");
    if (nombreAventura === "Nombre por defecto") {
      let respuesta = await Swal.fire({title: "Nombre de la aventura sin asignar",text: "Ponle un nombre a tu aventura para poder generar el proyecto", icon: 'error'});
      return;
    }

    //Se comprueba que no se está tratando con una aventura vacía
    let fases = props.getState<any>('DATA', []);
    if(fases.length === 0){
      Swal.fire({icon: 'error', title: 'Aventura vacía', text: "No se puede generar una aventura que no tenga ninguna fase.", allowEscapeKey: false, allowOutsideClick: false});
      return;
    }


    //En caso de que tengamos problemas con la clave de vuforia avisamos al usuario de esto
    let keyVuforiaValida = await checkVuforiaKey();
    if (keyVuforiaValida !== true) {
      let respuesta = await Swal.fire({title: "Clave de Vuforia incorrecta",text: "Inserte una clave de Vuforia válida para generar el proyecto", icon: 'error'});
      return;
    }


    //Se muestra una alerta indicando que se está intentando guardar la aventura en el servidor
    Swal.fire({
      title: 'Preparando aventura',
      html: 'Este proceso puede tardar un poco...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });

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
    Swal.fire({
      title: `Aventura generada`,
      icon:'success'
    })
  }

  //Metodo que toma el texto que se esté escribiendo en el form para indicar el nombre que queremos que tenga la aventura y lo
  //guarda para que la futura aventura que vayamos a descargar tenga dicho nombre
  const modifyAdventureName = (e: string): void => {
    props.setState('adventureName', e, "Nombre por defecto");
  }

  //MEtodo que devuelve el nombre de la aventura que se esta configurando
  const getAdventureName = (): string => {
    return props.getState('adventureName', "Nombre por defecto");
  }

  //Metodo que devuelve la key de vuforia otorgada por el usuario
  const getVuforiaKey = (): string => {
    return props.getState('vuforiaKey', "");
  }

  //Metodo que sierve para tratar la key de vuforia del usuario
  const modifyVuforiaKey = (e: string): void => {
    props.setState('vuforiaKey', e, "");
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
        <button className="my-btn btn-outline-dark2" style={{ fontSize: '170%' }} type="button" onClick={generateZip}>
          Generar Aventura
        </button>
        <button className="my-btn btn-outline-dark" style={{ fontSize: '170%', marginLeft: '15%' }} type="button" onClick={salvarAventura}>
          Guardar Aventura
        </button>
      </div>
    </div>
  );
};

export default AdventureSummary;