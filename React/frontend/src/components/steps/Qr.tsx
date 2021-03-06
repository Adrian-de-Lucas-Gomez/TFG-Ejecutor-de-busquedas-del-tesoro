import QRCode from "qrcode.react";
import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { StepComponentProps } from '../Steps';
import '../Styles/QR.css'
import Errorimage from "../../imgCards/Imagen.png"
import Swal from "sweetalert2";


const QR = (props: StepComponentProps): JSX.Element => {
    type FormElement = React.FormEvent<HTMLFormElement>;
    //Referencia en el DOM al div que contiene el QR que renderizamos
    const qrRef = useRef(null);
    //Donde guardamos el texto a codificar en QR
    const [text, setText] = useState<string>("");

    //Estado relacionado con la pista de la fase
    const [mostrarFormularioPista, setMostrarFormularioPista] =useState<boolean>(false);
    const [pista, setPista] = useState<string>("");
    
    useEffect(() => {
        //En caso de que haya que sobreescribir algo, cargo los datos que ya había de esta fase      
        if(props.getState<boolean>('SobreEscribir', false)){

            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []); 
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable',1)];

            //Cargo dichos datos en los elementos visuales
            setText(estadoACargar.QRText);
            setPista(estadoACargar.Pista);

            //Al estar reconfigurando una fase, esta está como mínimo completa y se puede guardar de primeras
            let myData = {Alert: false, MensageAlert: "", datosFase: estadoACargar };
            props.setState<any>('faseConfigurandose',myData,{});
        }
        
        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [props.getState<boolean>('SobreEscribir', false)]);


    //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se vean
    useEffect(() => {
        let jsonData = {tipo:"QRStage" ,QRText: text, Pista: pista};
        let myData = {Alert: (text === ""), MensageAlert: "El código QR no puede estar vacío", datosFase: jsonData };
        props.setState<any>('faseConfigurandose',myData,{});

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [pista, text]);


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

    
    //Método que sirve para actualizar la pista que tiene esta fase
    const updatePista = (nuevaPista:string) =>{
        setPista(nuevaPista);
    }
    //Metodo que sirve para lanzar una alerta en la que se informa sobre cómo hay que rellenar el formulario para incluir una fase de este tipo
    const tutorialFase = ()=>{
        Swal.fire({title: 'QR',text: "En esta fase puedes introducir un texto para generar un QR, el cual el jugador tendrá que buscar y escanear con su cámara para completar esta fase.", icon: 'info'});
    }

    return (
    <div >
        <div className="flex" style = {{display:"flex", flexDirection:"row", justifyContent:"center"  }}>
                <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase QR</h3>
                <button style={{width:"40px", height:"40px",textAlign:"center",verticalAlign:"center", background:"white", marginTop: "0.8%",marginLeft:"0.5%",  color: "white", padding: "10px", borderRadius:"50%"}} type="button" className="btn" onClick={tutorialFase} >{"💡"}</button>
        </div>


        <form className="center" style={{marginBottom:'1%'}} onSubmit={e => e.preventDefault()}>
            <input placeholder="Añada aqui el texto o enlace al que reedirige el QR..." className='input-text' type="text" size={60} required value={text} onChange ={ e =>{setText(e.target.value);}}></input>
        </form>
        <div ref={qrRef}>
            <QRCode className='QRImage' value={text} size={400} fgColor="black" bgColor="white" level="H"  />
        </div>

        <div className = 'botonesQR center'>
            <div>
                <form style={{textAlign:'center'}} onSubmit= {downloadQRCode}>
                    <button type="submit" className="my-btn btn-outline-dark2" style={{fontSize:'150%'}}>Descargar QR</button>
                </form>
            </div>
        </div>

        {/* Seccion pista */}
        {/* Boton para desplegar elementos para añadir una pista */}
        <form style={{textAlign:'center'}} onSubmit= {(e)=>{e.preventDefault(); setMostrarFormularioPista(!mostrarFormularioPista);}}>
            <button type="submit" className="my-btn btn-outline-dark" style={{fontSize:'150%'}}>Añadir Pista</button>
        </form>
        {/* Seccion que aparece y desaparece para poder asignar una pista */}
        {mostrarFormularioPista ? 
        <div className="App" style={{display: 'flex', marginTop:"1%", justifyContent: 'center', verticalAlign:'true'}}>
            <textarea style={{marginLeft:'0.5%' ,resize:"none", textAlign:"center"}} rows={3} cols={50} maxLength={100} onChange={(e) => {updatePista(e.target.value)}} placeholder="Pista que el jugador puede recibir" defaultValue={pista}/>
        </div>
        : null }

    </div>
    )
};
export default QR;