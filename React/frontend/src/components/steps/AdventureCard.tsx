import React, {useState} from "react"
import "../Styles/MyCard.css"

const AdventureCard = (props: {aventura:any, descripcion: any, textoBoton: any, funcionCargar: any , index:number }): JSX.Element => {

    const [indice, setIndice] = useState<number>(props.index);

  return (
    <div className="card">
      <h1 className="card__title">{props.aventura}</h1>


      {props.descripcion !== "" ? 
            <div >
              <h2>Descripción</h2>
              <p>{props.descripcion}</p>
            </div>
            : null }


        {/* Boton para hacer que nuestra carta se mueva hacia abajo en la lista de fases a hacer */}
      <button style={{marginBottom:'0.5%'}} className="my-btn btn-outline-dark3" onClick={()=>{props.funcionCargar(indice)}}> {props.textoBoton} </button>
    </div>
  );
};

export default AdventureCard;