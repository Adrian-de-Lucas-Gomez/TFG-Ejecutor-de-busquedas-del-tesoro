import { StepComponentProps } from '../Steps';
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import axios from "axios"


const Prueba = (): JSX.Element => {

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
          setText(response.data.Opciones[0]);
          setIndiceAventura(0);
        }
       })
       .catch(function (error) {
         //console.log(error);
       });


        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, []);


  //Método que mira la aventura que estamos seleccionando en cada momento y le pide al server que nos la de
  //en caso de que no exista alerta al usuario de que no hay nada que cargar
  const cargarAventura = async () =>{       
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
        <h4>Hola esto es un titulo</h4>
        <button className='row' onClick={aumentarIndice} data-testid='>' > Boton de prueba </button>
      </div>
  );
};

export default Prueba;