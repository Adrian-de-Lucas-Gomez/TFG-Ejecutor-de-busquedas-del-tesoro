import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { StepComponentProps } from '../Steps';
import swal from "sweetalert";
import Errorimage from "../../imgCards/Imagen.png"

const InputText = (props: StepComponentProps): JSX.Element => {
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
        setText(estadoACargar.Texto);
        setPista(estadoACargar.Pista);

        //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
        let myData = {Alert: false, MensageAlert: "", datosFase: estadoACargar };
        props.setState<any>('faseConfigurandose',myData,{});
    }
    
    //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
    return () => {}
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, [props.getState<boolean>('SobreEscribir', false)]);

    //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se veab
  useEffect(() => {
    let jsonData = {tipo:"InputTextStage" ,Texto: text, Pista: pista};
    let myData = {Alert: false, MensageAlert: "Rellena bien el texto", datosFase: jsonData };
    props.setState<any>('faseConfigurandose',myData,{});
    console.log("Ahora el estado es asi: "+JSON.stringify(jsonData));

    //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
    return () => {}
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, [pista, text]);



    const updatePista = (nuevaPista:string) =>{
        setPista(antigua => antigua =nuevaPista);
    }
 
    const tutorialFase = ()=>{
        swal({ title: "InputText", text: "En esta fase puedes configurar una constraseña que el jugador tiene que introducir para pasar a la siguiente, también puedes configurar una descripción para hacerle preguntas al jugador y que escriba la respuesta o para ayudarle a buscar en su entorno para descifrarla.",  icon: Errorimage });
    }

    return (
    <div >
        <div className="flex" style = {{display:"flex", flexDirection:"row", justifyContent:"center"  }}>
            <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase InputText</h3>
            <button style={{width:"40px", height:"40px",textAlign:"center",verticalAlign:"center", background:"white", marginTop: "20px",marginRight:"2px",  color: "white", padding: "10px", borderRadius:"50%"}} type="button" className="btn" onClick={tutorialFase} >{"💡"}</button>
        </div>


        <form className="center" style={{marginBottom:'1%'}} onSubmit={e => e.preventDefault()}>
            <text style={{ fontSize: '150%' , marginRight:'0.5%'}} className='Titulo' >Contraseña a encontrar:</text>
            <input placeholder="Añada aqui la contraseña..." className='input-text' type="text" size={60} required value={text} onChange ={ e =>{setText(e.target.value);}}></input>
        </form>

        {/* Seccion pista */}
        {/* Boton para desplegar elementos para añadir una pista */}
        <form style={{textAlign:'center'}} onSubmit= {(e)=>{e.preventDefault(); setMostrarFormularioPista(!mostrarFormularioPista);}}>
            <button type="submit" className="my-btn btn-outline-orange" style={{fontSize:'150%'}}>Añadir Pista</button>
        </form>
        {/* Seccion que aparece y desaparece para poder asignar una pista */}
        {mostrarFormularioPista ? 
        <div className="App" style={{display: 'flex', justifyContent: 'center', verticalAlign:'true'}}>
            <textarea style={{marginLeft:'0.5%' ,resize:"none", textAlign:"center"}} rows={3} cols={50} maxLength={100} onChange={(e) => {updatePista(e.target.value)}} placeholder="Pista que el jugador puede recibir" defaultValue={pista}/>
        </div>
        : null }
    </div>
    )
};
export default InputText;