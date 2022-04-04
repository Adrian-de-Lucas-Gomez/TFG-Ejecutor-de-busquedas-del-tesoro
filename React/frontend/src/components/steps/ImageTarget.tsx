import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { StepComponentProps } from '../Steps';
import pic from "../../Imagen.png";

const ImageTarget = (props: StepComponentProps): JSX.Element => {
    //Key de vuforia
    //const [key, setKey] = useState<string>("");
    //Imagen a usar como target de vuforia
    const [imageTarget, setImageTarget] = useState<File | null>(null);
    //Nombre del target a mostrar en esta fase
    //const [targetName, setTargetName] = useState<string>("")

    //Texto a mostrar en la aplicación cuando se encuentre el target
    const [textToShow, setTextToShow] = useState<string>("");

    const [showText, setShowText] = useState<boolean>(false);

    type FormElement = React.FormEvent<HTMLFormElement>;


    useEffect(() => {

        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if (props.getState<boolean>('SobreEscribir', false)) {

            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []);
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable', 1)];

            //Cargamos el unityPackage
            if (estadoACargar.Target instanceof File) setImageTarget(estadoACargar.Target);
            
            setTextToShow(estadoACargar.Text);
            setShowText(estadoACargar.AddText);
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => { }
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [props.getState<boolean>('SobreEscribir', false)]);

    const modifyQuestion = (e: string): void => {
        setTextToShow(e);
        if(imageTarget instanceof File)
            prepareForSave(imageTarget, imageTarget?.name as string, e);
        else prepareForSave(null, "", e);
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
                prepareForSave(e.target.files?.item(0), name, textToShow);
            }
            else
                alert("Por favor introduce una imagen en formato png, jpg o jpeg")
        }
        //Si no por defecto, asignamos el valor null
        else setImageTarget(null);
    }


    const prepareForSave = (imageTarget: File | null, nombreTarget: string, textToShow: string) => {
        console.log("PrepareForSave")
        let jsonData = { tipo: "ImageTargetStage", Target: imageTarget, TargetName: nombreTarget, AddText:showText, Text: textToShow };
        console.log(jsonData);
        let myData = { Alert: false, texto: "Hola", datosFase: jsonData };
        props.setState<any>('faseConfigurandose', myData, {});
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

        </div>
    )
};
export default ImageTarget;