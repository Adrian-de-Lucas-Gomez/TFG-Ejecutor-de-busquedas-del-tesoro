import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { Card, CardHeader, CardBody, CardFooter } from "react-simple-card";
import { CallTracker } from "assert";



const CartaAventura = (props: { fase:any, funcionCargarAventura:any, index: number}): JSX.Element => {

    const [indice, setIndice] = useState<number>(props.index);
    const [miAventura, setMiFase] = useState<any>(props.fase);
    
  return (
    <div className="App">
<Card className="centrado">
  
      <CardHeader>
          <h1>{miAventura}</h1>
      </CardHeader>

      <CardBody>
       <p>
        Esto es un contenido
       </p>
      </CardBody>
      <CardFooter>
          <button className = "my-btn btn-outline-brown" onClick={()=>{props.funcionCargarAventura(indice)}} data-testid='>' > Cargar Aventura </button>
      </CardFooter>
    </Card>
      </div>
  );
};

export default CartaAventura;