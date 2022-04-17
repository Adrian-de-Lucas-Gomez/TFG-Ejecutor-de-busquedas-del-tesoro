import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { StepComponentProps } from '../Steps';
import pic from "../../imgCards/Imagen.png";

const ImageTarget = (props: StepComponentProps): JSX.Element => {

    //Imagen a usar como target de vuforia
    const [imageTarget, setImageTarget] = useState<File | null>(null);
    //Nombre del target a mostrar en esta fase
    const [imageTargetName, setImageTargetName] = useState<string>("");
    //Texto a mostrar en la aplicación cuando se encuentre el target
    const [textToShow, setTextToShow] = useState<string>("");

    const [showText, setShowText] = useState<boolean>(false);

    const [mostrarFormularioPista, setMostrarFormularioPista] =useState<boolean>(false);
    const [pista, setPista] = useState<string>("");

    useEffect(() => {

        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if (props.getState<boolean>('SobreEscribir', false)) {

            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []);
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable', 1)];
            
            //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
            let myData = {Alert: false, MensageAlert: "", datosFase: estadoACargar };
            props.setState<any>('faseConfigurandose',myData,{});
            
            //Cargamos el imageTarget
            if (estadoACargar.Target instanceof File) setImageTarget(estadoACargar.Target);
            else setImageTargetName(estadoACargar.Target);

            setTextToShow(estadoACargar.Text);
            setShowText(estadoACargar.AddText);
            setPista(estadoACargar.Pista);
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => { }
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [props.getState<boolean>('SobreEscribir', false)]);

    //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se veab
    useEffect(() => {
        let jsonData = { tipo: "ImageTargetStage", Target: imageTarget, TargetName: imageTargetName, AddText:showText, Text: textToShow , Pista:pista};
        let myData = { Alert: false, texto: "Hola", datosFase: jsonData };
        props.setState<any>('faseConfigurandose', myData, {});
        console.log("Ahora el estado es asi: "+JSON.stringify(jsonData));
    
        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, [pista,imageTarget,imageTargetName,textToShow,showText]);


    const modifyQuestion = (e: string): void => {
        setTextToShow(e);
    }

    //Cambio de imagen para usar como Target
    const changeImageTarget = (e: React.ChangeEvent<HTMLInputElement>): void => {

        if (e.target.files?.item(0) instanceof File) {
            //Comprobamos si lo que nos han introducido en el formulario ha sido un fichero 
            let name: string = e.target.files?.item(0)?.name as string;
            let filename: string[] = name.split('.') as string[]
            let extension: string = filename[filename?.length - 1]

            if (extension === 'png' || extension === "jpg" || extension === "jpeg") {
                console.log("Updated file")
                setImageTarget(e.target.files?.item(0))
            }
            else
                alert("Por favor introduce una imagen en formato png, jpg o jpeg")
        }
        //Si no por defecto, asignamos el valor null
        else setImageTarget(null);
    }

    const updatePista = (nuevaPista:string) =>{
        setPista(nuevaPista);
    }


    return (
        <div >
            <h3 style={{ marginTop: '0.5%', marginBottom: '1%', fontSize: '200%' }} className="Titulo" >Configuración de fase Vuforia Image Target</h3>

            <div className="center">
                <form onSubmit={e => e.preventDefault()}>
                    <input type="checkbox" checked={showText} onChange={()=>setShowText(!showText)}/>
                    <input placeholder="Texto a mostrar tras encontrar la imagen..." className='input-text' type="text" size={60} required value={textToShow} onChange={e => modifyQuestion(e.target.value)}/>
                </form>
            </div>
            <div style={{marginTop:'0.5%'}} className="content-modal center">
                <img src= {imageTarget !==null ? window.URL.createObjectURL(imageTarget) : pic }/>   
            </div>
            <div>
                <form style={{ textAlign: 'center', marginTop: '1%', marginBottom: '0.5%' }} onSubmit= { e =>{e.preventDefault()}}>
                    <input style={{ fontSize: '150%' }} type="file" onChange={changeImageTarget} />
                </form>
            </div>


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
export default ImageTarget;