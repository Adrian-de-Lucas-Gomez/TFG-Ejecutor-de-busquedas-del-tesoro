import QRCode from "qrcode.react";
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { StepComponentProps } from '../Steps';
import '../Styles/QR.css'


const QR = (props: StepComponentProps): JSX.Element => {
    //Referencia en el DOM al div que contiene el QR que renderizamos
    const qrRef = useRef(null);
    //Donde guardamos el texto a codificar en QR
    const [text, setText] = useState<string>("");
    type FormElement = React.FormEvent<HTMLFormElement>;
    const [sobreEscribir, setSobreEscribir] = useState<boolean>(false);

    const [mostrarFormularioPista, setMostrarFormularioPista] =useState<boolean>(false);
    const [pista, setPista] = useState<string>("");
    
    useEffect(() => {
    // let info = {Alert: true, MensageAlert: "Rellena bien el texto del QR", datosFase: {} };
    // props.setState<any>('faseConfigurandose',info,{});

    //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
    //los datos que ya había de esta fase      
    if(props.getState<boolean>('SobreEscribir', false)){

        //Me quedo con lo que haya que sobreescribir
        let new_state = props.getState<any>('DATA', []); 
        let estadoACargar = new_state[props.getState<number>('FaseConfigurable',1)];
        //Me guardo tando la pregunta como las respuestas que había configuradas
        setText(estadoACargar.QRText);
        setPista(estadoACargar.Pista);

        //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
        let myData = {Alert: false, MensageAlert: "", datosFase: estadoACargar };
        props.setState<any>('faseConfigurandose',myData,{});
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

    const prepareForSave = (texto: string) => {
        setText(texto);
        let jsonData = {tipo:"QRStage" ,QRText: texto, Pista: pista};
        let myData = {Alert: false, MensageAlert: "Rellena bien el texto del QR", datosFase: jsonData };
        props.setState<any>('faseConfigurandose',myData,{});
    }

    const updatePista = (nuevaPista:string) =>{
        setPista(nuevaPista);
        prepareForSave(text);
    }
 
    return (
    <div >
        <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase QR</h3>
        <form className="center" style={{marginBottom:'1%'}} onSubmit={e => e.preventDefault()}>
            <input placeholder="Añada aqui el texto o enlace al que reedirige el QR..." className='input-text' type="text" size={60} required value={text} onChange ={ e =>{prepareForSave(e.target.value);}}></input>
        </form>
        <div ref={qrRef}>
            <QRCode className='QRImage' value={text} size={400} fgColor="black" bgColor="white" level="H"  />
        </div>

        <div className = 'botonesQR center'>
            <div>
                <form style={{textAlign:'center'}} onSubmit= {downloadQRCode}>
                    <button type="submit" className="my-btn btn-outline-orange" style={{fontSize:'150%'}}>Descargar QR</button>
                </form>
            </div>
            {/* <div style={{marginLeft:'4%'}}>
                <form style={{textAlign:'center'}} onSubmit= {guardaFase}>
                    <button type="submit" className="my-btn btn-outline-pink" style={{fontSize:'150%'}}>Guardar fase</button>
                </form>
            </div> */}
        </div>

        {/* Seccion pista */}
        {/* Boton para desplegar elementos para añadir una pista */}
        <form style={{textAlign:'center'}} onSubmit= {(e)=>{e.preventDefault(); setMostrarFormularioPista(!mostrarFormularioPista);}}>
            <button type="submit" className="my-btn btn-outline-orange" style={{fontSize:'150%'}}>Añadir Pista</button>
        </form>
        {/* Seccion que aparece y desaparece para poder asignar una pista */}
        {mostrarFormularioPista ? 
        <div className="App" style={{display: 'flex', justifyContent: 'center', verticalAlign:'true'}}>
            <span>
                <b>Pista de la fase:</b>            
            </span>
            <textarea style={{marginLeft:'0.5%' ,resize:"none", textAlign:"center"}} rows={3} cols={50} maxLength={100} onChange={(e) => {updatePista(e.target.value)}} placeholder="Pista que el jugador puede recibir" defaultValue={pista}/>
        </div>
        : null }

    </div>
    )
};
export default QR;