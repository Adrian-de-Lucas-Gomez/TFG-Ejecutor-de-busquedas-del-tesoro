import React, {useState} from "react"
import { StepComponentProps } from '../Steps'
import axios from "axios"

const ImageCharger = (props: StepComponentProps): JSX.Element => {


    //Esto es como un using en c++
    type FormElement = React.FormEvent<HTMLFormElement>;

    const [image, setImagen] = useState<File | undefined | null >(null);

    //Donde almacenamos la pregunta
    const [imageName, setName] = useState<string>("");

    const [sobreEscribir, setSobreEscribir] = useState<boolean>(false);

    
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

    const modifyQuestion = (e:string):void =>{        
        setName(e);
    }

    const guardaFase = (e:FormElement) => {
        //Para que no se refresque la pagina en el onSubmit
        e.preventDefault()
        if (imageName !== ""){

            //ME hago con el estado actual del array de info de la aventura
            let new_state = props.getState<any>('DATA', []); 
            //Preparo el diccionario que voy a meter en el registro
            let myData = {tipo:"ImageStage" ,imagen: imageName};

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
        else{
            alert("Rellena bien");
        }
    }

    return (
        <aside id="modal" className="modal">
            <div className="content-modal">
                <input type="file" onChange={changeImagen} />
                <button onClick={uploadImage}>GUARDAR IMAGEN</button>
            </div>
            <br>
            </br>

            <h2 className="Titulo"  >Configuracion de evento de imagen:</h2>
            <form onSubmit={e => e.preventDefault() }>
                <h3>Añada aqui el nombre de la imagen (temporal, solo para probar)</h3>
                <input className="form-control" type="text" required value={imageName} onChange ={ e =>modifyQuestion(e.target.value)}></input>
            </form>
            <br/>
            <h2>Nombre actual de la imagen: {imageName}</h2>
            <br/>
            <br/>
            <form onSubmit= {guardaFase}>
                <button className='SaveButton' type="submit">Guardar Fase</button>
            </form>
        </aside>
    )

};

export default ImageCharger;