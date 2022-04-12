import React, {useEffect, useState} from "react"
import { StepComponentProps } from '../Steps'
import axios from "axios"
import pic from "../../Imagen.png";

const Image = (props: StepComponentProps): JSX.Element => {

    const [image, setImagen] = useState<File | null >(null);
    const [description, setdescription] = useState<string>("");
    type FormElement = React.FormEvent<HTMLFormElement>;

    useEffect(() => {
        // let info = {Alert: true, MensageAlert: "Image: se debe de cargar alguna imagen", datosFase: {} };
        // props.setState<any>('faseConfigurandose',info,{});
        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if(props.getState<boolean>('SobreEscribir', false)){
            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []); 
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable',1)]; 

            //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
            let myData = {Alert: false, MensageAlert: "", datosFase: estadoACargar };
            props.setState<any>('faseConfigurandose',myData,{});

            //Me guardo la imagen que había almacenada en el estado actual
            if (estadoACargar.Imagen instanceof File)
                setImagen(estadoACargar.Imagen);

            setdescription(estadoACargar.description);
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, [props.getState<boolean>('SobreEscribir', false)]);



    //OBTENIENDO LA IMAGEN
    const changeImagen = (e:React.ChangeEvent<HTMLInputElement>):void => {  
        //Comprobamos si lo que nos han introducido en el formulario ha sido un fichero
        //En principio el tipo del input debería garantizarlo 
        if (e.target.files?.item(0) instanceof File){
            prepareForSave(e.target.files?.item(0), description);
            setImagen(e.target.files?.item(0))
        }
        //Si no por defecto, asignamos el valor null
        else {
            prepareForSave(null, description);
            setImagen(null);
        }
    }

    const prepareForSave = (imagenCargada: File | null , UIdescription: string) => {
        setdescription(UIdescription);
        let jsonData = {tipo:"ImageStage" ,Imagen: imagenCargada, description: UIdescription};
        let myData = {Alert: false, texto: "Hola", datosFase: jsonData };
        props.setState<any>('faseConfigurandose',myData,{});
    }


    return (
        <div id="modal" className="modal">
            <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase Image</h3>
            <div style={{marginTop:'0.5%'}} className="content-modal center">
                <img src= {image !==null ? window.URL.createObjectURL(image) : pic }/>   
            </div>
            <div>
                <form style={{textAlign:'center',marginTop:'0.5%', marginBottom:'0.5%'}} onSubmit= { e =>{e.preventDefault()}}>
                    <input style={{fontSize:'150%'}} type="file" onChange={changeImagen} />
                </form>
            </div>

            <form className="center" style={{ marginBottom: '1%' }} onSubmit={e => e.preventDefault()}>
                <text style={{ fontSize: '150%' , marginRight:'0.5%'}} className='Titulo' >Descripción:</text>
                <input placeholder="Texto para dar información sobre la imagen" className='input-text' type="text" size={60} required value={description} onChange={e => { prepareForSave(image, e.target.value); }}></input>
            </form>
        </div>
    )

};

export default Image;