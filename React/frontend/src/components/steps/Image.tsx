import React, {useEffect, useState} from "react"
import { StepComponentProps } from '../Steps'
import axios from "axios"
import pic from "../../imgCards/Imagen.png";
import swal from "sweetalert";
import Errorimage from "../../imgCards/Imagen.png"
import Swal from "sweetalert2";

const Image = (props: StepComponentProps): JSX.Element => {

    //Max bytes de las imagenes
    const maxBytesImg = 2097152;

    //Imagen de la fase
    const [image, setImagen] = useState<File | null >(null);

    //Descripcion que va a acompañar a la fase
    const [description, setdescription] = useState<string>("");
    type FormElement = React.FormEvent<HTMLFormElement>;

    //Estado relacionado con la pista de la fase
    const [mostrarFormularioPista, setMostrarFormularioPista] =useState<boolean>(false);
    const [pista, setPista] = useState<string>("");

    useEffect(() => {
        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if(props.getState<boolean>('SobreEscribir', false)){
            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []); 
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable',1)]; 

            //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
            let myData = {Alert: ((image === null) || (description==="")), MensageAlert: "La fase de imagen debe de tener una imagen cargada y la descripción no puede estar vacía.", datosFase: estadoACargar };
            props.setState<any>('faseConfigurandose',myData,{});

            //Me guardo la imagen que había almacenada en el estado actual
            if (estadoACargar.Imagen instanceof File){
                setImagen(estadoACargar.Imagen);
            }

            setPista(estadoACargar.Pista);
            setdescription(estadoACargar.description);
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, [props.getState<boolean>('SobreEscribir', false)]);


    //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se veab
    useEffect(() => {
        let jsonData = {tipo:"ImageStage" ,Imagen: image, description: description,Pista: pista};
        let myData = {Alert: ((image === null) || (description==="")), MensageAlert: "La fase de imagen debe de tener una imagen cargada y la descripción no puede estar vacía.", datosFase: jsonData };
        props.setState<any>('faseConfigurandose',myData,{});
        console.log("Ahora el estado es asi: "+JSON.stringify(jsonData));

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [pista, image, description]);

    //MEtodo que analiza el fichero dado por el usuario y en caso de que sea una imagen valida se la guarda en su estado
    const changeImagen = (e:React.ChangeEvent<HTMLInputElement>):void => {  
        //Comprobamos si lo que nos han introducido en el formulario ha sido un fichero
        //En principio el tipo del input debería garantizarlo 
        if (e.target.files?.item(0) instanceof File){
            let file: File | null = e.target.files?.item(0);
            let name: string = file?.name as string;
            let filename: string[] = name.split('.') as string[]
            let extension: string = filename[filename?.length - 1]

            //Tipos de imagenes permitidas 
            if ((extension === 'png' || extension === "jpg" || extension === "jpeg") && (file?.size ?? 0) <= maxBytesImg) {
                setImagen(file)
            }
            else{
                e.target.value = "";
                setImagen(null)
                Swal.fire({icon:"warning", title:"No se ha podido cargar la imagen",text:"Por favor introduce una imagen en formato png, jpg o jpeg con un tamaño máximo de 2MB."})
            }
        }
        //Si no por defecto, asignamos el valor null
        else {
            setImagen(null);
        }
    }

    //Metodo para actualizar la pista de la fase
    const updatePista = (nuevaPista:string) =>{
        setPista(nuevaPista);
    }

    //Metodo que sirve para lanzar una alerta en la que se informa sobre cómo hay que rellenar el formulario para incluir una fase de este tipo
    const tutorialFase = ()=>{
        Swal.fire({title: 'Imagen',text: "En esta fase puedes mostrarle al jugador una imagen junto con una descripción para informarle sobre algo en su entorno o para dar contexto en tu aventura.", icon: 'info'});
    }


    return (
        <div id="modal" className="modal">
            <div className="flex" style = {{display:"flex", flexDirection:"row", justifyContent:"center"  }}>
                <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase Image</h3>
                <button style={{width:"40px", height:"40px",textAlign:"center",verticalAlign:"center", background:"white", marginTop: "0.8%",marginLeft:"0.5%",  color: "white", padding: "10px", borderRadius:"50%"}} type="button" className="btn" onClick={tutorialFase} >{"💡"}</button>
            </div>

            <div style={{marginTop:'0.5%'}} className="content-modal center">
                <img style={{maxWidth:"50%"}} src= {image !==null ? window.URL.createObjectURL(image) : pic }/>   
            </div>
            <div>
                <form style={{textAlign:'center',marginTop:'0.5%', marginBottom:'0.5%'}} onSubmit= { e =>{e.preventDefault()}}>
                    <input style={{fontSize:'150%', color:"white"}} type="file" onChange={changeImagen} />
                </form>
            </div>

            <form className="center" style={{ marginBottom: '1%' }} onSubmit={e => e.preventDefault()}>
                <text style={{ fontSize: '150%' , marginRight:'0.5%'}} className='Titulo' >Descripción:</text>
                <input placeholder="Texto para dar información sobre la imagen" className='input-text' type="text" size={60} required value={description} onChange={e => {setdescription(e.target.value)}}></input>
            </form>

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

export default Image;