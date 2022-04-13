import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { CallTracker } from "assert";
import "../Styles/MyCard.css"

import QRPic from "../../QRStageImage.png";
import QuizPic from "../../QuizStageImage.png";
import ImageChargerPic from "../../ImageChargerStageImage.png";
import ImageTargetPic from "../../ImageTargetStageImage.png";
import SoundPic from "../../SoundStageImage.png";
import Errorimage from "../../Imagen.png"


const PhaseCard = (props: {fase:any,funcionMofify:any, funcionDelete: any,funcionMover: any , index:number }): JSX.Element => {

    const [indice, setIndice] = useState<number>(props.index);
    const [miFase, setMiFase] = useState<any>(props.fase);
    const [hint, setHint] = useState<string>("");


    //Metodo que recibe el bloque con la informacion de la fase a la que representamos y dependiendo del tipo de fase
    //que seamos devolvemos una imagen u otra
    const imagenMostrar=(miFase:any):any=>{
      if(miFase.tipo === "QRStage")return QRPic;
      if(miFase.tipo === "QuizStage") return QuizPic;
      if(miFase.tipo === "ImageStage") return ImageChargerPic
      if(miFase.tipo === "ImageTargetStage") return ImageTargetPic;
      if(miFase.tipo === "SoundStage") return SoundPic;

      return Errorimage;
    }


  return (
    <div className="card">
        {/* Boton para hacer que nuestra carta se mueva hacia arriba en la lista de fases a hacer */}
      <button className="card__btn"  onClick={()=>{props.funcionMover(indice,-1)}}  > {"<"}  </button>

      <div className="card__body">
          {/* Titulo */}
        <h1 className="card__title">{props.fase.tipo}</h1>

        {/* Pista para el jugador */}
        <b>Pista de la fase</b>
        <p>{miFase.Pista==="" ? "Fase sin pista" : miFase.Pista }</p>

        {/* Parte que representa el text area para setear la pista de la fase a través de la carta */}
        {/* <b>Pista de la fase</b>
        <textarea style={{resize:"none", textAlign:"center"}} rows={3} cols={50} maxLength={100} onChange={(e) => setHint(e.target.value)} placeholder="Pista que el jugador puede recibir" defaultValue=""/> */}

        {/* Imagen que representa el tipo de fase que somos y pequeña descripción */}
        <img src={imagenMostrar(props.fase)} className="card__image" />
        {/* <p className="card__description">{"Pista de la fase"}</p> */}

        
        {/* Botones para modificar y borrar la fase que representa esta carta */}
        <button className = "my-btn btn-outline-brown" style={{textAlign:'center', marginTop:'1%', fontSize:'120%'}} onClick={()=>{props.funcionMofify(indice)}} data-testid='>' > Hacer Cambios </button>
        <button className = "my-btn btn-outline-red" style={{marginLeft:'1%'}} onClick={()=>{props.funcionDelete(indice)}} data-testid='>' > Borrar Fase </button>
      </div>

        {/* Boton para hacer que nuestra carta se mueva hacia abajo en la lista de fases a hacer */}
      <button className="card__btn" onClick={()=>{props.funcionMover(indice,1)}}   > {">"} </button>
    </div>
  );
};

export default PhaseCard;