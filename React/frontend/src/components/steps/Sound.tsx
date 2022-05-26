import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { StepComponentProps } from '../Steps';
import '../Styles/QR.css'
import swal from "sweetalert";
import Errorimage from "../../imgCards/Imagen.png"

//@ts-ignore
import ejemplo from "../../escopeta.mp3"
import Swal from "sweetalert2";

let path = "../../escopeta.mp3"

const Sound = (props: StepComponentProps): JSX.Element => {


  //Estados relacionados con el audio y la descripción de la fase
  const [ficheroSonido, setFicheroSonido] = useState<File | null >(null);
  const [sonido, setSonido] = useState<any>(new Audio(ejemplo));  
  const [description, setdescription] = useState<string>("");


  //Estados relacionados con la pista de la fase
  const [mostrarFormularioPista, setMostrarFormularioPista] =useState<boolean>(false);
  const [pista, setPista] = useState<string>("");
    
  useEffect(() => {

    //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
    //los datos que ya había de esta fase      
    if(props.getState<boolean>('SobreEscribir', false)){

        //Me quedo con lo que haya que sobreescribir
        let new_state = props.getState<any>('DATA', []); 
        let estadoACargar = new_state[props.getState<number>('FaseConfigurable',1)];
        console.log("El estado a cargar es " + JSON.stringify(estadoACargar));
        //Me guardo la imagen que había almacenada en el estado actual
        if (estadoACargar.Sonido instanceof File){
          setFicheroSonido(estadoACargar.Sonido);
          setSonido(new Audio(window.URL.createObjectURL(estadoACargar.Sonido)));
        }
        setPista(estadoACargar.Pista);
        setdescription(estadoACargar.description);


        //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
        let myData = {Alert: (ficheroSonido===null || description===""), MensageAlert: "La fase de sonido debe de tener un archivo de audio asignado", datosFase: estadoACargar };
        props.setState<any>('faseConfigurandose',myData,{});
    }
    
    //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
    return () => {}
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, [props.getState<boolean>('SobreEscribir', false)]);

  
  //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se veab
  useEffect(() => {
    let jsonData = {tipo:"SoundStage" ,Sonido: ficheroSonido, description: description, Pista: pista};
    let myData = {Alert: (ficheroSonido===null || (description==="")), MensageAlert: "La fase de sonido debe de tener un archivo de audio asignado", datosFase: jsonData };
    props.setState<any>('faseConfigurandose',myData,{});

    //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
    return () => {}
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, [pista, sonido,ficheroSonido,description]);


  //Metodo encargado de actualizar la pista de la fase
  const updatePista = (nuevaPista:string) =>{
    setPista(nuevaPista);
  }


  //Metodo que mira si tenemos un sonido y en caso afirmativo inicia su reproduccion
  const playAudio =() => {
    if(sonido !== null)
      sonido.play();
  }

  //Metodo que mira si tenemos un sonido y en caso afirmativo lo para 
  const stopAudio =() => {
    if(sonido !== null)
      sonido.load();
  }

  //Metodo para tratar el audio que se quiere utilizar en esta fase
  const changeSound = (e:React.ChangeEvent<HTMLInputElement>):void => {  
    //Comprobamos si lo que nos han introducido en el formulario ha sido un fichero
    //En principio el tipo del input debería garantizarlo 
    if (e.target.files?.item(0) instanceof File){
        setFicheroSonido(e.target.files?.item(0));

        //@ts-ignore
        setSonido(new Audio(window.URL.createObjectURL(e.target.files?.item(0))));
    }
    //Si no por defecto, asignamos el valor null
    else {
        setFicheroSonido(null);
    }
  }

  //Metodo que sirve para lanzar una alerta en la que se informa sobre cómo hay que rellenar el formulario para incluir una fase de este tipo
  const tutorialFase = ()=>{
    Swal.fire({title: 'Sound',text: "En esta fase puedes configurar un audio que el jugador va a tener que escuchar entero para poder completarla, puedes añadirlo para darle contexto en tu aventura o pedirle que busque un objeto que hace determinado sonido.", icon: 'info'});
  }


    return (
    <div style={{textAlign:'center',marginTop:'0.5%', marginBottom:'0.5%'}}>

        <div className="flex" style = {{display:"flex", flexDirection:"row", justifyContent:"center"  }}>
                <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'  }} className="Titulo" >Configuración de fase Sound</h3>
                <button style={{width:"40px", height:"40px",textAlign:"center",verticalAlign:"center", background:"white", marginTop: "0.8%",marginLeft:"0.5%",  color: "white", padding: "10px", borderRadius:"50%"}} type="button" className="btn" onClick={tutorialFase} >{"💡"}</button>
        </div>

        <button className="my-btn btn-outline-dark" style={{marginRight:"0.5%"}} onClick={playAudio}>
          <span>Play Audio</span>
        </button>
        <button className="my-btn btn-outline-dark" style={{marginLeft:"0.5%"}} onClick={stopAudio}>
          <span>Stop Audio</span>
        </button>
        <form style={{textAlign:'center',marginTop:'0.5%', marginBottom:'0.5%'}} onSubmit= { e =>{e.preventDefault()}}>
          <input style={{fontSize:'150%', color:"white"}} type="file" accept=".mp3,.wav" onChange={changeSound} />
        </form>

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
export default Sound;