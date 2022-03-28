import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from "react"
import { StepComponentProps } from '../Steps';

const ImageTarget = (props: StepComponentProps): JSX.Element => {
    //Key de vuforia
    const [key, setKey] = useState<string>("");
    //unitypackage de vuforia
    const [unityPackage, setUnityPackage] = useState<File | null >(null);
    //Nombre del target a mostrar en esta fase
    const [targetName, setTargetName] = useState<string>("")

    type FormElement = React.FormEvent<HTMLFormElement>;
    //Actualizar datos
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

        //Cargamos la clave de nuevo
        setKey(estadoACargar.Key);
        //Cargamos el unityPackage
        setUnityPackage(estadoACargar.Package);
        //Cargamos el targer
        setTargetName(estadoACargar.Target);
    }
    
    //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
    return () => {}
    //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
  }, [props.getState<boolean>('SobreEscribir', false)]);

    //Cambio de UnityPackage
    const changeUnityPackage = (e:React.ChangeEvent<HTMLInputElement>):void => {  
        
        if (e.target.files?.item(0) instanceof File){
            //Comprobamos si lo que nos han introducido en el formulario ha sido un fichero 
            let filename:string[] = e.target.files?.item(0)?.name.split('.') as string[]
            let extension:string = filename[filename?.length - 1]

            if( extension === 'unitypackage'){
                console.log("Updated file")
                setUnityPackage( e.target.files?.item(0))
                prepareForSave(key, e.target.files?.item(0), targetName);
            }
            else
                alert("Por favor introduce un UnityPackage")
        }
        //Si no por defecto, asignamos el valor null
        else setUnityPackage(null);
    }


    const prepareForSave = (llave: string, paquete: File | null , nombreTarget:string ) => {
        let myData = {tipo:"ImageTargetStage" ,Key: llave, Package:paquete, Target: nombreTarget};
        let info = {Alert: false, texto: "Hola", datosFase: myData };
        props.setState<any>('faseConfigurandose',info,{});
    }

 
    return (
    <div >
        <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase Vuforia Image Target</h3>
        
        <form className="center" onSubmit={e => e.preventDefault()}>
            <input size={80} placeholder="Introduzca aquí la key de vuforia..." className='input-text' type="text" required value={key} onChange ={ e =>{setKey(e.target.value); prepareForSave(e.target.value, unityPackage, targetName);}}></input>
        </form>

        <form style={{marginTop:'1%'}} className="center" onSubmit={e => e.preventDefault()}>
            <input size={80} placeholder="Introduzca aquí el nombre del target a usar..." className='input-text' type="text" required value={targetName} onChange ={ e =>{setTargetName(e.target.value);prepareForSave(key, unityPackage, e.target.value);}}></input>
        </form>

        <div>
            <form style={{textAlign:'center',marginTop:'1%', marginBottom:'0.5%'}} >
                <input style={{fontSize:'150%'}} type="file" onChange={changeUnityPackage} />
                {/* <button type="submit" className="my-btn btn-outline-pink" style={{fontSize:'150%', marginLeft:'1%'}}>Guardar fase</button> */}
            </form>
        </div>

    </div>
    )
};
export default ImageTarget;