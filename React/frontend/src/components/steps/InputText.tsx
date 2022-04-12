import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { StepComponentProps } from '../Steps';

const InputText = (props: StepComponentProps): JSX.Element => {
    //Donde guardamos el texto a codificar en QR
    const [text, setText] = useState<string>("");
    type FormElement = React.FormEvent<HTMLFormElement>;
    const [sobreEscribir, setSobreEscribir] = useState<boolean>(false);
    
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

        //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
        let myData = {Alert: false, MensageAlert: "", datosFase: estadoACargar };
        props.setState<any>('faseConfigurandose',myData,{});
    }
    
    //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
    return () => {}
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, [props.getState<boolean>('SobreEscribir', false)]);

    const prepareForSave = (texto: string) => {
        setText(texto);
        let jsonData = {tipo:"InputTextStage" ,Texto: texto};
        let myData = {Alert: false, MensageAlert: "Rellena bien el texto", datosFase: jsonData };
        props.setState<any>('faseConfigurandose',myData,{});
    }
 
    return (
    <div >
        <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase InputText</h3>
        <form className="center" style={{marginBottom:'1%'}} onSubmit={e => e.preventDefault()}>
            <text style={{ fontSize: '150%' , marginRight:'0.5%'}} className='Titulo' >Contraseña a encontrar:</text>
            <input placeholder="Añada aqui la contraseña..." className='input-text' type="text" size={60} required value={text} onChange ={ e =>{prepareForSave(e.target.value);}}></input>
        </form>
    </div>
    )
};
export default InputText;