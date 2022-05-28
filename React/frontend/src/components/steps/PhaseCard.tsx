import React, {useState} from "react"
import "../Styles/MyCard.css"

import QRPic from "../../resources/imgCards/QRStageImage.png";
import QuizPic from "../../resources/imgCards/QuizStageImage.png";
import SoundPic from "../../resources/imgCards/SoundStageImage.png";
import GPSPic from "../../resources/imgCards/GPSStageImage.png";
import InputTextPic from "../../resources/imgCards/InputTextImage.png"
import Errorimage from "../../resources/imgCards/Imagen.png"


const PhaseCard = (props: {fase:any,funcionMofify:any, funcionDelete: any,funcionMover: any , index:number }): JSX.Element => {

  //Indice que representa la fase que representa dentro de las que tiene la aventura
    const [indice, setIndice] = useState<number>(props.index);
    const [miFase, setMiFase] = useState<any>(props.fase);


    //Metodo que recibe el bloque con la informacion de la fase a la que representamos y dependiendo del tipo de fase
    //que seamos devolvemos una imagen u otra
    const imagenMostrar=(miFase:any):any=>{
      if(miFase.tipo === "QRStage")return QRPic;
      if(miFase.tipo === "QuizStage") return QuizPic;
      if(miFase.tipo === "ImageStage")return window.URL.createObjectURL(miFase.Imagen);
      if(miFase.tipo === "ImageTargetStage") return window.URL.createObjectURL(miFase.Target);
      if(miFase.tipo === "SoundStage") return SoundPic;
      if(miFase.tipo === "InputTextStage")return InputTextPic;
      if(miFase.tipo === "GPSStage")return GPSPic;

      return Errorimage;
    }


  return (
    <div className="card">
        {/* Boton para hacer que nuestra carta se mueva hacia arriba en la lista de fases a hacer */}
      <button className="card__btn" style={{fontSize:'250%'}} onClick={()=>{props.funcionMover(indice,-1)}}  > {"⇧"}  </button>

      <div className="card__body">
          {/* Titulo */}
        <h1 className="card__title">{(props.index+1).toString()+"º : "+props.fase.tipo}</h1>

        {/* Imagen que representa el tipo de fase que somos y pequeña descripción */}
        <img src={imagenMostrar(props.fase)} className="card__image" />
        {/* <p className="card__description">{"Pista de la fase"}</p> */}

        {/* Pista para el jugador */}
        <b>Pista de la fase</b>
        <p style={{color:"black", fontWeight:"bold"}} >{props.fase.Pista ==="" ? "Fase sin pista" : props.fase.Pista }</p>

        {/* Botones para modificar y borrar la fase que representa esta carta */}
        <button className = "my-btn btn-outline-dark3" style={{textAlign:'center', marginTop:'1%', fontSize:'120%', marginRight:"1%"}} onClick={()=>{props.funcionMofify(indice)}} data-testid='>' > Hacer Cambios </button>
        <button className = "my-btn btn-outline-red" style={{marginLeft:'1%'}} onClick={()=>{props.funcionDelete(indice)}} data-testid='>' > Borrar Fase </button>

      </div>

        {/* Boton para hacer que nuestra carta se mueva hacia abajo en la lista de fases a hacer */}
      <button className="card__btn" style={{fontSize:'250%'}} onClick={()=>{props.funcionMover(indice,1)}}   > {"⇩"} </button>
    </div>
  );
};

export default PhaseCard;