import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { StepComponentProps } from '../Steps';
import '../Styles/QR.css'

//@ts-ignore
import ejemplo from "../../escopeta.mp3"

let path = "../../escopeta.mp3"

const Sound = (props: StepComponentProps): JSX.Element => {

    const [sobreEscribir, setSobreEscribir] = useState<boolean>(false);

    const [ficheroSonido, setFicheroSonido] = useState<File | null >(null);
    const [sonido, setSonido] = useState<any>(new Audio(ejemplo));  

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
        console.log("El estado a cargar es " + JSON.stringify(estadoACargar));
        //Me guardo la imagen que había almacenada en el estado actual
        if (estadoACargar.Sonido instanceof File){
          setFicheroSonido(estadoACargar.Sonido);
          setSonido(new Audio(window.URL.createObjectURL(estadoACargar.Sonido)));
          setPista(estadoACargar.Pista);
        }

        //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
        let myData = {Alert: false, MensageAlert: "", datosFase: estadoACargar };
        props.setState<any>('faseConfigurandose',myData,{});
    }
    
    //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
    return () => {}
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, [props.getState<boolean>('SobreEscribir', false)]);

  
  // useEffect(() => {
  //   console.log("Ha habido un cambio en algo de lo que es el estado: "+pista+" + "+sonido+" + "+ficheroSonido);
  //   //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
  //   return () => {}
  //   //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  // }, [pista, sonido,ficheroSonido]);


  const prepareForSave = (sonidoCargado: File | null) => {
    let jsonData = {tipo:"SoundStage" ,Sonido: sonidoCargado, Pista: pista};
    let myData = {Alert: false, texto: "Hola", datosFase: jsonData };
    props.setState<any>('faseConfigurandose',myData,{});
  }

  const updatePista = (nuevaPista:string) =>{
    setPista(nuevaPista);
    prepareForSave(ficheroSonido);
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

    //OBTENIENDO el audio
    const changeSound = (e:React.ChangeEvent<HTMLInputElement>):void => {  
      //Comprobamos si lo que nos han introducido en el formulario ha sido un fichero
      //En principio el tipo del input debería garantizarlo 
      if (e.target.files?.item(0) instanceof File){
          prepareForSave(e.target.files?.item(0));
          setFicheroSonido(e.target.files?.item(0));

          //@ts-ignore
          setSonido(new Audio(window.URL.createObjectURL(e.target.files?.item(0))));
      }
      //Si no por defecto, asignamos el valor null
      else {
          setFicheroSonido(null);
          prepareForSave(null);
      }
  }



    return (
    <div style={{textAlign:'center',marginTop:'0.5%', marginBottom:'0.5%'}}>
        <button onClick={playAudio}>
          <span>Play Audio</span>
        </button>
        <button onClick={stopAudio}>
          <span>Stop Audio</span>
        </button>
        <form style={{textAlign:'center',marginTop:'0.5%', marginBottom:'0.5%'}} onSubmit= { e =>{e.preventDefault()}}>
          <input style={{fontSize:'150%'}} type="file" accept=".mp3,.wav" onChange={changeSound} />
        </form>


        {/* Seccion pista */}
        {/* Boton para desplegar elementos para añadir una pista */}
        <form style={{textAlign:'center'}} onSubmit= {(e)=>{e.preventDefault(); setMostrarFormularioPista(!mostrarFormularioPista);}}>
            <button type="submit" className="my-btn btn-outline-orange" style={{fontSize:'150%'}}>Añadir Pista</button>
        </form>
        {/* Seccion que aparece y desaparece para poder asignar una pista */}
        {mostrarFormularioPista ? 
        <div className="App" style={{display: 'flex', justifyContent: 'center', verticalAlign:'true'}}>
            <span>
              <b>Pista de la fase:</b>            
            </span>
            <textarea style={{marginLeft:'0.5%' ,resize:"none", textAlign:"center"}} rows={3} cols={50} maxLength={100} onChange={(e) => {updatePista(e.target.value)}} placeholder="Pista que el jugador puede recibir" defaultValue={pista}/>
        </div>
        : null }
    </div>
    )
};
export default Sound;