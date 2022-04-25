import React, {useState} from "react"
import "../Styles/MyCard.css"

const AdventureCard = (props: {aventura:any, descripcion: any, funcionCargar: any , index:number }): JSX.Element => {

    const [indice, setIndice] = useState<number>(props.index);
    const [miAventura, setMiAventura] = useState<any>(props.aventura);

  return (
    <div className="card">
      <h1 className="card__title">{miAventura}</h1>


      {props.descripcion !== "" ? 
            <div >
              <h4>Descripción</h4>
              <p>{props.descripcion}</p>
            </div>
            : null }


        {/* Boton para hacer que nuestra carta se mueva hacia abajo en la lista de fases a hacer */}
      <button className="card__btn" onClick={()=>{props.funcionCargar(indice)}}   > Cargar Aventura </button>
    </div>
  );
};

export default AdventureCard;