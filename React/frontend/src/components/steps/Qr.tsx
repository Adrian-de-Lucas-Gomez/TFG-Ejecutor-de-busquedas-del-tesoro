import QRCode from "qrcode.react";
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { StepComponentProps } from '../Steps';
import { queries } from "@testing-library/react";
import '../Styles/QR.css'


const QR = (props: StepComponentProps): JSX.Element => {
    //Referencia en el DOM al div que contiene el QR que renderizamos
    const qrRef = useRef(null);
    //Donde guardamos el texto a codificar en QR
    const [text, setText] = useState<string>("");
    type FormElement = React.FormEvent<HTMLFormElement>;
    const [sobreEscribir, setSobreEscribir] = useState<boolean>(false);
    
    useEffect(() => {

    //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
    //los datos que ya había de esta fase      
    if(props.getState<boolean>('SobreEscribir', false)){

        //Indico que ya no es necesario sobreescribir nada, porque ya nos encargamos
        setSobreEscribir(true);
        props.setState('SobreEscribir', false, false);

        //Me quedo con lo que haya que sobreescribir
        let new_state = props.getState<any>('DATA', []); 
        let estadoACargar = new_state[props.getState<number>('FaseConfigurable',1)];

        //Me guardo tando la pregunta como las respuestas que había configuradas
        setText(estadoACargar.QRText);
    }
    
    //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
    return () => {}
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, [props.getState<boolean>('SobreEscribir', false)]);



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


    //Metodo utilizado para guardar los datos que actuales del
    //QR en el registro de fases actual de la aventura
    const guardaFase = (e:FormElement) => {
        //Para que no se refresque la pagina en el onSubmit
        e.preventDefault();

        //Miro a ver si hay algo que pueda guardar
        if (text !== ""){
            console.log("Llamada a guardar fase")
            //ME hago con el estado actual del array de info de la aventura
            let new_state = props.getState<any>('DATA', []);
            //Preparo los datos que voy a añadir
            let myData = {tipo:"QRStage" ,QRText: text};
            console.log(new_state);

            //Los añado a una copia del estado y establezco esta copia como el estadoa actual de las fases            
            if(sobreEscribir === true){
                //De esta forma se puede meter el estado en unaposicion concreta en lugar de hacerlo en el final siempre
                let position = props.getState<number>('FaseConfigurable',1);
                new_state.splice(position,1,myData);
            }
            //Si no hay que sobreescribir nada simplemente pusheamos al final de los datos
            else {
                //Lo almaceno en la lista de fases que tengo disponibles
                let position = props.getState<number>('WhereToPush',1);
                new_state.splice(position, 0, myData);
            }
            
            props.setState('DATA',new_state,[]);
            //Importante aumentar el indice de donde estamos metiendo nuevos elementos a la aventura para que no 
            //se metan todos en la posicion X y que luego estén TODOS EN ORDEN INVERSO
            props.setState<number>('WhereToPush',props.getState<number>('WhereToPush',1)+1,1);
        }
        else{
            alert("Rellena bien");
        }
    }

 
    return (
    <div >
        <h3 style={{marginBottom:'0.5%',fontSize:'200%'}} className="Titulo" >Configuración de fase QR</h3>
        <form className="center" style={{marginBottom:'1%'}} onSubmit={e => e.preventDefault()}>
            <input placeholder="Añada aqui el texto o enlace al que reedirige el QR..." className='input-text' type="text" size={60} required value={text} onChange ={ e =>setText(e.target.value)}></input>
        </form>
        <div ref={qrRef}>
            <QRCode className='QRImage' value={text} size={400} fgColor="black" bgColor="white" level="H"  />
        </div>

        <div className = 'botonesQR center'>
            <div>
                <form style={{textAlign:'center'}} onSubmit= {guardaFase}>
                    <button type="submit" className="my-btn btn-outline-pink" style={{fontSize:'150%'}}>Guardar fase</button>
                </form>
            </div>

            <div style={{marginLeft:'4%'}}>
                <form style={{textAlign:'center'}} onSubmit= {downloadQRCode}>
                    <button type="submit" className="my-btn btn-outline-orange" style={{fontSize:'150%'}}>Descargar QR</button>
                </form>
            </div>       
        </div>

    </div>
    )
};
export default QR;