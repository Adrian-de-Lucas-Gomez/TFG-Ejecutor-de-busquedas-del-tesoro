import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { StepComponentProps } from '../Steps';
import pic from "../../imgCards/Imagen.png";
import swal from "sweetalert";
import Errorimage from "../../imgCards/Imagen.png"
import Swal from "sweetalert2";
import { fileURLToPath } from "url";

const ImageTarget = (props: StepComponentProps): JSX.Element => {

    interface ImageSize {
        width: number;
        height: number
    }

    //Max bytes de las imagenes
    const maxBytesImg = 2097152; 
    //Min pixeles de ancho en el target
    const minTargetWidth = 372;

    //Imagen a usar como target de vuforia
    const [imageTarget, setImageTarget] = useState<File | null>(null);
    const [imageTargetSize, setImageTargetSize] = useState<ImageSize>({ width: 0, height: 0 });
    
    //Tipo de fase de AR que va a emplear el usuario: de superponer una imagen
    //o un texto
    const [selectedItem, setSelectedItem] = useState<string>("Image");
    
    //Texto a mostrar en la aplicación cuando se encuentre el target
    const [textToShow, setTextToShow] = useState<string>("");

    //Imagen a superponer sobre el target de Vuforia
    const [imageToAdd, setImageToAdd] = useState<File | null>(null);
    const [imageToAddSize, setImageToAddSize] = useState<ImageSize>({ width: 0, height: 0 });

    //Estado relacionado con la pista de la fase
    const [mostrarFormularioPista, setMostrarFormularioPista] = useState<boolean>(false);
    const [pista, setPista] = useState<string>("");

    let targetFileResult: File | null = null;
    let imageFileResult: File | null = null;

    useEffect(() => {
        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if (props.getState<boolean>('SobreEscribir', false)) {

            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []);
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable', 1)];

            //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
            let myData = { Alert: ((imageTarget === null)  || (textToShow === "")), MensageAlert: "La fase debe tener una imagen cargada y en caso de mostrar un texto, este no puede estar vacío", datosFase: estadoACargar };
            props.setState<any>('faseConfigurandose', myData, {});

            //Cargamos el imageTarget
            if (estadoACargar.Target instanceof File ){
                console.log("UseEffect carga imagen")
                changeImageTarget(estadoACargar.Target)
            } 
            else { 
                console.log("Useffect no carga imagen ")
                setImageTarget(null);
            }

            setSelectedItem(estadoACargar.TargetType);

            if(estadoACargar.TargetType === "Image"){
                console.log("UseEffect carga imagen2")
                changeImageToAdd(estadoACargar.OverlappingImage)
            }
            else{
                setTextToShow(estadoACargar.Text);
            }
            setPista(estadoACargar.Pista);
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => { }
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [props.getState<boolean>('SobreEscribir', false)]);

    //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se vean
    useEffect(() => {
        let jsonData;
        let myData;

        if (selectedItem === "Image") {
            jsonData = { tipo: "ImageTargetStage", Target: imageTarget, TargetType: selectedItem, OverlappingImage: imageToAdd, Pista: pista };
            myData = { Alert: ((imageTarget === null || imageToAdd === null) || (imageTargetSize.width < minTargetWidth || imageTargetSize.width!=imageToAddSize.width || imageTargetSize.height!=imageToAddSize.height)), MensageAlert: "La fase debe tener una imagen target cargada de minimo "+minTargetWidth+" pixeles de ancho, y en caso de querer superponer una imagen sobre el target, esta debe tener el mismo tamaño en pixeles y no puede ser nula", datosFase: jsonData };
        }
        else {
            jsonData = { tipo: "ImageTargetStage", Target: imageTarget, TargetType: selectedItem, Text: textToShow, Pista: pista };
            myData = { Alert: ((imageTarget === null) || (textToShow === "")), MensageAlert: "La fase debe tener una imagen target cargada y en caso de mostrar un texto, este no puede estar vacío", datosFase: jsonData };
        }

        props.setState<any>('faseConfigurandose', myData, {});
        console.log("Ahora el estado es asi: " + JSON.stringify(jsonData));

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => { }
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [pista, imageTarget, textToShow, imageToAdd]);


    //Metodo utilizado para actualizar la descripción de la fase
    const modifyDescription = (e: string): void => {
        setTextToShow(e);
    }

    //MEtodo utilizado para especificar si se quiere superponer una imagen o un texto en esta fase
    const onSelectorChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        e.preventDefault();
        setSelectedItem(e.target.value);
    }

    //Cambio de imagen para usar como Target
    const changeImageTargetImage = (e: React.ChangeEvent<HTMLImageElement>): void => {
        if(targetFileResult===null) return;
        e.preventDefault();
        setImageTargetSize(e.target)
        setImageTarget(targetFileResult)
    }

    const changeImageTargetInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();

        if (e.target.files?.item(0) instanceof File) {
            //Comprobamos si lo que nos han introducido en el formulario ha sido un fichero 
            let file: File | null = e.target.files?.item(0);
            let name: string = file?.name as string;
            let filename: string[] = name.split('.') as string[]
            let extension: string = filename[filename?.length - 1]
            let img = document.getElementById("imageTarget") as HTMLImageElement

            if ((extension === 'png' || extension === "jpg" || extension === "jpeg") && (file?.size ?? 0) <= maxBytesImg) {
                changeImageTarget(file)
            }
            else{
                e.target.value = "";
                img.src = pic
                targetFileResult = null
                Swal.fire({icon:"warning", title:"No se ha podido cargar la imagen",text:"Por favor introduce una imagen en formato png, jpg o jpeg con un tamaño máximo de 2MB"})
            }  
        }
        //Si no por defecto, asignamos el valor null
        else targetFileResult = null;
    }

    const changeImageTarget = (file: File | null): void => {
        console.log("Updated file")
        let img = document.getElementById("imageTarget") as HTMLImageElement
        img.src = window.URL.createObjectURL(file as Blob)
        targetFileResult = file
        setImageTarget(targetFileResult)
    }

    const changeImageToAddImage = (e: React.ChangeEvent<HTMLImageElement>): void => {
        if(imageFileResult===null) return;
        e.preventDefault();
        setImageToAddSize(e.target)
        setImageToAdd(imageFileResult)
    }

    const changeImageToAddInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();

        if (e.target.files?.item(0) instanceof File) {
            //Comprobamos si lo que nos han introducido en el formulario ha sido un fichero 
            let file: File | null = e.target.files?.item(0);
            let name: string = file?.name as string;
            let filename: string[] = name.split('.') as string[]
            let extension: string = filename[filename?.length - 1]
            let img = document.getElementById("imageToAdd") as HTMLImageElement

            if ((extension === 'png' || extension === "jpg" || extension === "jpeg") && (file?.size ?? 0) <= maxBytesImg) {
                changeImageToAdd(file)
            }
            else{
                e.target.value = "";
                img.src = pic
                imageFileResult = null
                Swal.fire({icon:"warning", title:"No se ha podido cargar la imagen",text:"Por favor introduce una imagen en formato png, jpg o jpeg con un tamaño máximo de 2MB"})
            }  
        }
        //Si no por defecto, asignamos el valor null
        else imageFileResult = null;
    }

    const changeImageToAdd = (file: File | null): void => {
        console.log("Updated file")
        let img = document.getElementById("imageToAdd") as HTMLImageElement
        img.src = window.URL.createObjectURL(file as Blob)
        imageFileResult = file
        setImageToAdd(imageFileResult)
    }

    //Metodo para actualizar la pista de la fase
    const updatePista = (nuevaPista: string) => {
        setPista(nuevaPista);
    }

    //Metodo que sirve para lanzar una alerta en la que se informa sobre cómo hay que rellenar el formulario para incluir una fase de este tipo
    const tutorialFase = ()=>{
        Swal.fire({title: 'ImageTarget',text: "En esta fase puedes configurar una imágen que el jugador va a tener que buscar y escanear con el móvil, también puedes configurar si quieres que se le muestre algún texto tras el escaneo.", icon: 'info'});
    }


    return (
        <div >
            <div className="flex" style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                <h3 style={{ marginTop: '0.5%', marginBottom: '1%', fontSize: '200%' }} className="Titulo" >Configuración de fase Vuforia Image Target</h3>
                <button style={{width:"40px", height:"40px",textAlign:"center",verticalAlign:"center", background:"white", marginTop: "0.8%",marginLeft:"0.5%",  color: "white", padding: "10px", borderRadius:"50%"}} type="button" className="btn" onClick={tutorialFase} >{"💡"}</button>
            </div>

            <div style={{ marginTop: '0.5%' }} className="content-modal center">
                <img id="imageTarget" style={{maxWidth:"50%"}} src={pic} onLoad={changeImageTargetImage} />
            </div>

            <div>
                <form style={{ textAlign: 'center', marginTop: '1%', marginBottom: '1%' }} onSubmit={e => { e.preventDefault() }}>
                    <input style={{ fontSize: '150%' , color:"white"}} type="file" onChange={changeImageTargetInput} />
                </form>
            </div>

            <div className="center" style={{marginBottom:"1%"}}>
                <select className="mySelect" defaultValue={selectedItem} onChange={onSelectorChange}>
                    <option value="Image">Superponer imagen</option>
                    <option value="Text">Mostrar texto</option>
                </select>
            </div>

            {selectedItem === 'Image' ?
                <div>
                    <div className="content-modal center">
                        <img id="imageToAdd" style={{maxWidth:"50%"}} src={pic} onLoad={changeImageToAddImage} />
                    </div>

                    <div>
                        <form style={{ textAlign: 'center', marginTop: '1%'}} onSubmit={e => { e.preventDefault() }}>
                            <input style={{ fontSize: '150%', color:"white" }} type="file" onChange={changeImageToAddInput} />
                        </form>
                    </div>
                </div>

                :

                <div className="center">
                    <form onSubmit={e => e.preventDefault()}>
                        <input placeholder="Texto a mostrar tras encontrar la imagen..." className='input-text' type="text" size={60} required value={textToShow} onChange={e => modifyDescription(e.target.value)} />
                    </form>
                </div>
            }


            {/* Seccion pista */}
            {/* Boton para desplegar elementos para añadir una pista */}
            <form style={{ textAlign: 'center' }} onSubmit={(e) => { e.preventDefault(); setMostrarFormularioPista(!mostrarFormularioPista); }}>
                <button type="submit" className="my-btn btn-outline-dark" style={{fontSize: '150%', marginTop:"0.5%" }}>Añadir Pista</button>
            </form>
            {/* Seccion que aparece y desaparece para poder asignar una pista */}
            {mostrarFormularioPista ?
                <div className="App" style={{ display: 'flex', marginTop:"1%", justifyContent: 'center', verticalAlign: 'true' }}>
                    <textarea style={{ marginLeft: '0.5%', resize: "none", textAlign: "center" }} rows={3} cols={50} maxLength={100} onChange={(e) => { updatePista(e.target.value) }} placeholder="Pista que el jugador puede recibir" defaultValue={pista} />
                </div>
                : null}
        </div>
    )
};
export default ImageTarget;