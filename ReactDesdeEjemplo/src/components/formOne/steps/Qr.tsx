import QRCode from "qrcode.react";
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { StepComponentProps } from '../../Steps';
import { queries } from "@testing-library/react";


const QR = (props: StepComponentProps): JSX.Element => {
  
    //Referencia en el DOM al div que contiene el QR que renderizamos
    const qrRef = useRef(null);
    //Donde guardamos el texto a codificar en QR
    const [text, setText] = useState<string>("");
   type FormElement = React.FormEvent<HTMLFormElement>;


    //Metodo que se encarga de convertir el qr a formato png y descargarlo
    const downloadQRCode = (evt: React.FormEvent) => {
        //No refrescamos la pagina
        evt.preventDefault();
        //@ts-ignore (Esto es pa que no salte un error de typescript, sin esto no compila (porque asimila que es null))
        //Cogemos el primer elemento canvas que cuelga del div al que esta asociado la referencia
        // (qrcode.react esta representado como un <canvas></canvas>, si estuviese representado
        //con otra etiqueta habria que poner esa)
        let canvas = qrRef.current.querySelector("canvas");
        
        //devuelve un data URI el cual contiene una representación de una imagen en png
        let image:string = canvas.toDataURL("image/png");
        
        //Creamos un componente <a> html al que vamos a asignar la informacion
        //del QR qur vamos a descargar
        let anchor:HTMLAnchorElement = document.createElement("a");
        //le asignamos como referencia el qr ya convertido en imagen
        anchor.href = image;
        //Le ponemos el nombre con el que la vamos a descargar
        anchor.download = text +`.png`;
        //Metemos el componente <a> en el cuerpo de nuestro html de react
        document.body.appendChild(anchor);
        //Clicamos sobre el para descargarlo
        anchor.click();
        //Quitamos el componente <a> puesto que ya ha cumplido su funcion
        document.body.removeChild(anchor);
      };

    //Funcion que genra algo de tipo JSON que va a pedir la App cuando vaya a generar un JSON con la aventura
    function DataForJSON(){
        return {QRCode: text};
    }


    //Metodo utilizado para guardar los datos que actuales del
    //QR en el registro de fases actual de la aventura
    const guardaFase = (e:FormElement) => {
        //Para que no se refresque la pagina en el onSubmit
        e.preventDefault();

        //Miro a ver si hay algo que pueda guardar
        if (text !== ""){
            console.log("Llamada a guardar fase")
            //ME hago con el estado actual del array de info de la aventura
            let new_state = props.getState<[{}]>('DATA', [{}]); 
            //Preparo los datos que voy a añadir
            let myData = {tipo:"QRStage" ,QRText: text};
            console.log(new_state);

            //Los añado a una copia del estado y establezco esta copia como el estadoa actual de las fases
            new_state.push(myData);
            props.setState('DATA',new_state,[{}]);
        }
        else{
            console.log("Rellena bien")
        }
    }

 
    return (
    <div >
        <h3>Añada aqui el link al que reedirige el  QR:</h3>
        <form onSubmit={e => e.preventDefault()}>
            <input className="form-control" type="text" required value={text} onChange ={ e =>setText(e.target.value)}></input>
        </form>
        <div ref={qrRef}>
            <QRCode value={text} size={400} fgColor="black" bgColor="white" level="H"  />
        </div>
        <form onSubmit= {guardaFase}>
                <button className="btn btn-outline-primary mt-2" type="submit">Guardar Fase</button>
            </form>
        <form onSubmit= {downloadQRCode}>
            <button className="btn btn-outline-primary mt-2" type="submit">Descargar QR</button>
        </form>
    </div>
    )
};
export default QR;