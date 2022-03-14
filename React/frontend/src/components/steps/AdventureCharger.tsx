import { StepComponentProps } from '../Steps';
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import axios from "axios"


const AdventureCharger = (props: StepComponentProps): JSX.Element => {

    //Texto que representa la aventura que estamos seleccionando para cargar
    const [text, setText] = useState<string>("por defecto");
    //Indice de la aventtra que estamos seleccionando
    const [indiceAventura, setIndiceAventura] = useState<number>(0);
    //Lista de las aventuras que el server nos ha informado que existen y que podemos seleccionar y cargar
    const [aventurasDisponibles, setAventurasDisponibles] = useState<any>([]);


    //Nada más empezar lo que hago es pedirle al server las aventuras que tenemos disponibles para cargar 
    useEffect(() => {
      axios.get("./aventuras-guardadas").then (response => {
        //Seteamos las aventuras que tenemos disponibles a lo que nos ha dicho el server
        console.log("Las opciones son "+response.data.Opciones);
        setAventurasDisponibles(response.data.Opciones);
        //Ponemos el texto a una cosa u otra para informar al jugador de lo que se está seleccionando
        if(response.data.Opciones.length < 1)
          setText("No hay aventuras disponibles");  
        else {
          setText(aventurasDisponibles[0]);
          setIndiceAventura(0);
        }
       })
       .catch(function (error) {
         //console.log(error);
       });


        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, []);

//Metodo que tiene como objetivo preguntar al server por las opciones que hay disponibles en el momento de la solicitud
  const soliciarOpciones = ():void =>{        
    axios.get("./aventuras-guardadas").then (response => {
      console.log("Las opciones son "+response.data.Opciones);
      setAventurasDisponibles(response.data.Opciones);
     })
     .catch(function (error) {
       //console.log(error);
     });
  }


  //Método que mira la aventura que estamos seleccionando en cada momento y le pide al server que nos la de
  //en caso de que no exista alerta al usuario de que no hay nada que cargar
  const cargarAventura = ():void =>{       
    if(aventurasDisponibles.length <1 ){
      alert("No hay aventuras disponibles"); 
      return;
    }
    //Le pido al server una aventura con un nombre que se le indica, y cuando nos llegue la cargamos en nuestro estado global de react
    console.log("Vamos a solicitar una carga de la aventura "+aventurasDisponibles[indiceAventura]);
    var jsonFinal = {Nombre: aventurasDisponibles[indiceAventura] }
    axios.post("./dame-aventura", {json:JSON.stringify(jsonFinal, null, 2)}).then(function (response) {
      console.log("Me ha llegado que la aventura a cargar es "+response.data.AventuraGuardada);
      props.setState('DATA',JSON.parse(response.data.AventuraGuardada).fases, []);
      props.setState('adventureName',JSON.parse(response.data.AventuraGuardada).Gencana, "Nombre por defecto");
    });

    //Como hemos cargado cosas vamos a resetear los indices relacionados con la configuración de la aventura
    props.setState<number>('WhereToPush',0,0);
    props.setState<number>('FaseConfigurable',0,0);
    props.setState<number>('FaseABorrar',0,0);
  }

//Métodos para alterar el índice de selección de aventura
  const aumentarIndice = ():void =>{    
    var result = indiceAventura;
    result++;
    if(result >= aventurasDisponibles.length) result = aventurasDisponibles.length-1;
    if(result <0) result = 0;    
    setIndiceAventura(result);
    console.log("La aventura a la que apuntamos ahora es "+aventurasDisponibles[result]);
    setText(aventurasDisponibles[result]);
  } 
  const disminuirIndice = ():void =>{    
    var result = indiceAventura;
    result--;
    if(result < 0) result = 0;    
    setIndiceAventura(result);
    console.log("La aventura a la que apuntamos ahora es "+aventurasDisponibles[result]);
    setText(aventurasDisponibles[result]);
  } 

  return (
    <div className="redBackGround">
        <h4>Cargar Aventura Del Servidor: {text}</h4>
        <div className='rows'>
          <button className='row' onClick={disminuirIndice} data-testid='<'> - </button>
          <p className='row'>{indiceAventura+1}º </p>
          <button className='row' onClick={aumentarIndice} data-testid='>' > + </button>
          <p className='row'>de las {aventurasDisponibles.length} disponibles</p>

          {/* Boton para mandar a que nos carguen una aventura en concreto */}
          <button className='row' onClick={cargarAventura} data-testid='>' > Cargar aventura </button>
          <button className='row' onClick={soliciarOpciones} data-testid='>' > Solicitar opciones </button>

        </div>
      </div>
  );
};

export default AdventureCharger;