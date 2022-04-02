import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { Card, CardHeader, CardBody, CardFooter } from "react-simple-card";
import { CallTracker } from "assert";
import "../Styles/Card.css"




const CartaFase = (props: { fase:any, funcionMofify:any, funcionDelete: any,funcionMover: any , index: number}): JSX.Element => {

    const [indice, setIndice] = useState<number>(props.index);
    const [miFase, setMiFase] = useState<any>(props.fase);
    
  return (
    <div>
      <Card  >
            <CardHeader>
            <button style={{textAlign:'center', marginTop:'1%', fontSize:'120%'}}  onClick={()=>{props.funcionMover(indice,-1)}} data-testid='>' > {"<"} </button>
            </CardHeader>

            <CardBody>
                <h1>{props.fase.tipo}</h1>
                <button className = "my-btn btn-outline-brown" style={{textAlign:'center', marginTop:'1%', fontSize:'120%'}} onClick={()=>{props.funcionMofify(indice)}} data-testid='>' > Hacer Cambios </button>
                <button className = "my-btn btn-outline-red" style={{marginLeft:'1%'}} onClick={()=>{props.funcionDelete(indice)}} data-testid='>' > Borrar Fase </button>
            </CardBody>
            <CardFooter>
            <button className = "my-btn btn-outline-red" style={{textAlign:'center', marginTop:'1%', fontSize:'120%'}} onClick={()=>{props.funcionMover(indice,1)}} data-testid='>' > {">"} </button>
            </CardFooter>
        </Card>
      </div>
  );
};

export default CartaFase;