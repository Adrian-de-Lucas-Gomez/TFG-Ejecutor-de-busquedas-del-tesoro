import React, {useEffect, useState} from "react"
import { StepComponentProps } from '../Steps'
import axios from "axios"
import pic from "../../Imagen.png";

const ImageCharger = (props: StepComponentProps): JSX.Element => {

    const [image, setImagen] = useState<File | null >(null);
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
            console.log("Updated file")
            setImagen( e.target.files?.item(0))
        }
        //Si no por defecto, asignamos el valor null
        else setImagen(null);
    }

    const uploadImage = () =>{
        
        //ME hago con el estado actual del array de info de la aventura
        let new_state = props.getState<any>('DATA', []); 
        //Preparo el diccionario que voy a meter en el registro
        let myData = {tipo:"ImageStage" ,Imagen: image};

        console.log("Sobreescribir es igual a "+sobreEscribir);
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

        //Y tras modificar la copia del registro para que me contenga pongo esta copia como el registro de la aventura
        props.setState('DATA',new_state,[]);

        //Importante aumentar el indice de donde estamos metiendo nuevos elementos a la aventura para que no 
        //se metan todos en la posicion X y que luego estén TODOS EN ORDEN INVERSO
        props.setState<number>('WhereToPush',props.getState<number>('WhereToPush',1)+1,1);
    }


    return (
        <aside id="modal" className="modal">
            <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase Image Charger</h3>
            <div style={{marginTop:'0.5%'}} className="content-modal center">
                <img src= {image !==null ? window.URL.createObjectURL(image) : pic }/>   
            </div>
            <div>
                <form style={{textAlign:'center',marginTop:'0.5%', marginBottom:'0.5%'}} onSubmit= { e =>{e.preventDefault(); uploadImage();}}>
                    <input style={{fontSize:'150%'}} type="file" onChange={changeImagen} />
                    <button type="submit" className="my-btn btn-outline-pink" style={{fontSize:'150%', marginLeft:'1%'}}>Guardar fase</button>
                </form>
            </div>
        </aside>
    )

};

export default ImageCharger;