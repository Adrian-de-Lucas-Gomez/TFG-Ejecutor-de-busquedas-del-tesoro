import React, {useState} from "react"
import { StepComponentProps } from '../Steps'
import axios from "axios"

const ImageCharger = (props: StepComponentProps): JSX.Element => {

    const [image, setImagen] = useState<File | undefined | null >(null);
    
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
        //Si la informacion que tenemos almacenada es la de un archivo,
        //significa que tenemos algo que enviar
        if(image instanceof File){   
            //Creamos un FORMDATA que sera el que finalmente enviemos en la peticion POST
            const formData = new FormData(); 
            //añadimos los campos imageCharger (identificador que se usa en el servidor para 
            //saber que tiene que descargar )
            formData.append('imageCharger', image , image.name);
            //Hacemos una peticion POST a nuestro servidor que esta escuchando en el puerto 4000
            //TO DO: buscar una forma mas "limpia" de cablear la ruta, tb es probable que esta parte tenga
            //que sufrir modificaciones cuando este en el servidor y no en una maquina local  
            axios.post("http://localhost:4000/image-upload", formData);
            console.log("Post Request: DONE")      
        }
    }

    return (
        <aside id="modal" className="modal">
            <div className="content-modal">
                <input type="file" onChange={changeImagen} />
                <button onClick={uploadImage}>GUARDAR IMAGEN</button>
            </div>
        </aside>
    )

};

export default ImageCharger;