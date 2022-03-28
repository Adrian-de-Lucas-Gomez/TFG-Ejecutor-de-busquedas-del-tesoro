import React, {useEffect, useState} from "react"
import { StepComponentProps } from '../Steps'
import axios from "axios"
import pic from "../../Imagen.png";

const ImageCharger = (props: StepComponentProps): JSX.Element => {

    const [image, setImagen] = useState<File | null >(null);
    const [sobreEscribir, setSobreEscribir] = useState<boolean>(false);


    useEffect(() => {
        // let info = {Alert: true, MensageAlert: "ImageCharger: se debe de cargar alguna imagen", datosFase: {} };
        // props.setState<any>('faseConfigurandose',info,{});
        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if(props.getState<boolean>('SobreEscribir', false)){

            //Indico que ya no es necesario sobreescribir nada, porque ya nos encargamos
            //setSobreEscribir(true);
            //props.setState('SobreEscribir', false, false);

            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []); 
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable',1)]; 


            //Me guardo la imagen que había almacenada en el estado actual
            if (estadoACargar.Imagen instanceof File)
                setImagen(estadoACargar.Imagen);
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
            prepareForSave(e.target.files?.item(0));
            setImagen( e.target.files?.item(0))
        }
        //Si no por defecto, asignamos el valor null
        else {
            prepareForSave(null);
            setImagen(null);
        }
    }

    const prepareForSave = (imagenCargada: File | null ) => {
        let myData = {tipo:"ImageStage" ,Imagen: imagenCargada};
        let info = {Alert: false, texto: "Hola", datosFase: myData };
        props.setState<any>('faseConfigurandose',info,{});
    }


    return (
        <aside id="modal" className="modal">
            <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase Image Charger</h3>
            <div style={{marginTop:'0.5%'}} className="content-modal center">
                <img src= {image !==null ? window.URL.createObjectURL(image) : pic }/>   
            </div>
            <div>
                <form style={{textAlign:'center',marginTop:'0.5%', marginBottom:'0.5%'}} onSubmit= { e =>{e.preventDefault()}}>
                    <input style={{fontSize:'150%'}} type="file" onChange={changeImagen} />
                    {/* <button type="submit" className="my-btn btn-outline-pink" style={{fontSize:'150%', marginLeft:'1%'}}>Guardar fase</button> */}
                </form>
            </div>
        </aside>
    )

};

export default ImageCharger;