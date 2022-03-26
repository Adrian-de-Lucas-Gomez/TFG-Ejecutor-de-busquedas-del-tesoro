import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
//import 'bootstrap/dist/css/bootstrap.min.css'
import { CallTracker } from "assert";




const Prueba = (props: { fase:any, funcionMofify:any, funcionDelete: any, index: number}): JSX.Element => {

    const [indice, setIndice] = useState<number>(props.index);
    const [miFase, setMiFase] = useState<any>(props.fase);
    
  return (
    <div >
      {/* <Card>
        <Card.Body>
          <Card.Title>
              Fase {indice}: {props.fase.tipo}
          </Card.Title>
        </Card.Body>
      </Card> */}
          <h1>Fase {indice}: {props.fase.tipo}</h1>
          <button className = "my-btn btn-outline-brown" onClick={()=>{props.funcionMofify(indice)}} data-testid='>' > Hacer Cambios </button>
          <button className = "my-btn btn-outline-red" style={{marginLeft:'1%'}} onClick={()=>{props.funcionDelete(indice)}} data-testid='>' > Borrar Fase </button>
      </div>
  );
};

export default Prueba;