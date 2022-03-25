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


    const guardaFase = (e:FormElement) => {
        //Para que no se refresque la pagina en el onSubmit
        e.preventDefault();

        if(key !== "" && targetName !== "" && unityPackage !== null){
            console.log("Llamada a guardar fase")
            //ME hago con el estado actual del array de info de la aventura
            let new_state = props.getState<any>('DATA', []); 
            //Preparo los datos que voy a añadir
            let myData = {tipo:"ImageTargetStage" ,Key: key, Package:unityPackage, Target: targetName};
            console.log(new_state);

            //Los añado a una copia del estado y establezco esta copia como el estadoa actual de las fases            
            if(sobreEscribir === true){
                //De esta forma se puede meter el estado en una posicion concreta en lugar de hacerlo en el final siempre
                let position = props.getState<number>('FaseConfigurable',1);
                new_state.splice(position,1,myData);
            }
            //Si no hay que sobreescribir nada simplemente pusheamos al final de los datos
            else {
                //Lo almaceno en la lista de fases que tengo disponibles
                let position = props.getState<number>('WhereToPush',1);
                new_state.splice(position, 0, myData);
            }
            
            props.setState('DATA',new_state,[]);
            //Importante aumentar el indice de donde estamos metiendo nuevos elementos a la aventura para que no 
            //se metan todos en la posicion X y que luego estén TODOS EN ORDEN INVERSO
            props.setState<number>('WhereToPush',props.getState<number>('WhereToPush',1)+1,1);
        }
        else{
            alert("Rellena bien");
        }
    }

    //Cambio de UnityPackage
    const changeUnityPackage = (e:React.ChangeEvent<HTMLInputElement>):void => {  
        
        if (e.target.files?.item(0) instanceof File){
            //Comprobamos si lo que nos han introducido en el formulario ha sido un fichero 
            let filename:string[] = e.target.files?.item(0)?.name.split('.') as string[]
            let extension:string = filename[filename?.length - 1]

            if( extension === 'unitypackage'){
                console.log("Updated file")
                setUnityPackage( e.target.files?.item(0))
            }
            else
                alert("Por favor introduce un UnityPackage")
        }
        //Si no por defecto, asignamos el valor null
        else setUnityPackage(null);
    }

 
    return (
    <div >
        <h3 style={{marginBottom:'0.5%',fontSize:'200%'}} className="Titulo" >Configuración de fase Vuforia Image Target</h3>
        
        <form className="center" onSubmit={e => e.preventDefault()}>
            <input size={80} placeholder="Introduzca aquí la key de vuforia..." className='input-text' type="text" required value={key} onChange ={ e =>setKey(e.target.value)}></input>
        </form>

        <form style={{marginTop:'1%'}} className="center" onSubmit={e => e.preventDefault()}>
            <input size={80} placeholder="Introduzca aquí el nombre del target a usar..." className='input-text' type="text" required value={targetName} onChange ={ e =>setTargetName(e.target.value)}></input>
        </form>

        <div>
            <form style={{textAlign:'center',marginTop:'1%', marginBottom:'0.5%'}} onSubmit= {guardaFase}>
                <input style={{fontSize:'150%'}} type="file" onChange={changeUnityPackage} />
                <button type="submit" className="my-btn btn-outline-pink" style={{fontSize:'150%', marginLeft:'1%'}}>Guardar fase</button>
            </form>
        </div>

    </div>
    )
};
export default ImageTarget;