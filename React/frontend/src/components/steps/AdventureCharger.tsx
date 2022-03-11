import { StepComponentProps } from '../Steps';
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import axios from "axios"


const AdventureCharger = (props: StepComponentProps): JSX.Element => {


    const [text, setText] = useState<string>("");
    const [aventurasDisponibles, setAventurasDisponibles] = useState<any>([]);


    useEffect(() => {

       
        
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, []);

  return (
    <div className="redBackGround">
        <h4>Cargar Aventura Del Servidor</h4>
        <div className='rows'>
          <button className='row' data-testid='<'> - </button>
          <p className='row'>{props.getState('WhereToPush',0)+1}º </p>
          <button className='row' data-testid='>' > + </button>
          <p className='row'>de los {props.getState<any>('DATA', []).length} actuales</p>
        </div>
      </div>
  );
};

export default AdventureCharger;