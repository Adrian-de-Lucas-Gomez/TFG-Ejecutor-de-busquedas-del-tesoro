import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { StepComponentProps } from '../Steps';
import pic from "../../imgCards/Imagen.png";
import swal from "sweetalert";
import Errorimage from "../../imgCards/Imagen.png"
import Swal from "sweetalert2";

const ImageTarget = (props: StepComponentProps): JSX.Element => {

    interface ImageSize {
        width: number;
        height: number
    }

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

    const [mostrarFormularioPista, setMostrarFormularioPista] = useState<boolean>(false);
    const [pista, setPista] = useState<string>("");

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
            if (estadoACargar.Target instanceof File){
                console.log("UseEffect carga imagen")
                setImageTarget(estadoACargar.Target);  
            } 
            else { 
                console.log("Useffect no carga imagen ")
                setImageTarget(null);
            }

            setSelectedItem(estadoACargar.TargetType);

            if(estadoACargar.TargetType === "Image"){
                setImageToAdd(estadoACargar.OverlappingImage);
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

    //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se veab
    useEffect(() => {
        let jsonData;
        let myData;
        if (selectedItem === "Image") {
            jsonData = { tipo: "ImageTargetStage", Target: imageTarget, TargetType: selectedItem, OverlappingImage: imageToAdd, Pista: pista };
            myData = { Alert: ((imageTarget === null) || (imageToAdd === null)), MensageAlert: "La fase debe tener una imagen cargada y en caso de querer superponer una imagen sobre el target, esta no puede ser nula", datosFase: jsonData };
        }
        else {
            jsonData = { tipo: "ImageTargetStage", Target: imageTarget, TargetType: selectedItem, Text: textToShow, Pista: pista };
            myData = { Alert: ((imageTarget === null) || (textToShow === "")), MensageAlert: "La fase debe tener una imagen cargada y en caso de mostrar un texto, este no puede estar vacío", datosFase: jsonData };
        }

        props.setState<any>('faseConfigurandose', myData, {});
        console.log("Ahora el estado es asi: " + JSON.stringify(jsonData));

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => { }
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [pista, imageTarget, textToShow, imageToAdd]);


    const modifyDescription = (e: string): void => {
        setTextToShow(e);
    }

    const onSelectorChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        e.preventDefault();
        setSelectedItem(e.target.value);
    }

    //Cambio de imagen para usar como Target
    const changeImageTarget = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
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

    const changeImageToAdd = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        if (e.target.files?.item(0) instanceof File) {
            //Comprobamos si lo que nos han introducido en el formulario ha sido una imagen png 
            let name: string = e.target.files?.item(0)?.name as string;
            let filename: string[] = name.split('.') as string[]
            let extension: string = filename[filename?.length - 1]
            console.log(e.target.files?.item(0));
            if (extension === 'png') {
                setImageToAdd(e.target.files?.item(0));
            }
            else
                alert("Por favor introduce una imagen en formato png");
        }
        else setImageToAdd(null);

    }

    const updatePista = (nuevaPista: string) => {
        setPista(nuevaPista);
    }

    const tutorialFase = ()=>{
        Swal.fire({title: 'ImageTarget',text: "En esta fase puedes configurar una imágen que el jugador va a tener que buscar y escanear con el móvil, también puedes configurar si quieres que se le muestre algún texto tras el escaneo.", icon: 'info'});
    }


    return (
        <div >
            <div className="flex" style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                <h3 style={{ marginTop: '0.5%', marginBottom: '1%', fontSize: '200%' }} className="Titulo" >Configuración de fase Vuforia Image Target</h3>
                <button style={{ width: "40px", height: "40px", textAlign: "center", verticalAlign: "center", background: "white", marginTop: "20px", marginRight: "2px", color: "white", padding: "10px", borderRadius: "50%" }} type="button" className="btn" onClick={tutorialFase} >{"💡"}</button>
            </div>

            <div style={{ marginTop: '0.5%' }} className="content-modal center">
                <img /*onLoad={e => setImageTargetSize({ width: , height:})} */src={imageTarget !== null ? window.URL.createObjectURL(imageTarget) : pic} />
            </div>

            <div>
                <form style={{ textAlign: 'center', marginTop: '1%', marginBottom: '0.5%' }} onSubmit={e => { e.preventDefault() }}>
                    <input style={{ fontSize: '150%' }} type="file" onChange={changeImageTarget} />
                </form>
            </div>

            <div className="center">
                <select defaultValue={selectedItem} onChange={onSelectorChange}>
                    <option value="Image">Superponer imagen</option>
                    <option value="Text">Mostrar texto</option>
                </select>
            </div>

            {selectedItem === 'Image' ?
                <div>
                    <div style={{ marginTop: '0.5%' }} className="content-modal center">
                        <img src={imageToAdd !== null ? window.URL.createObjectURL(imageToAdd) : pic} />
                    </div>

                    <div>
                        <form style={{ textAlign: 'center', marginTop: '1%', marginBottom: '0.5%' }} onSubmit={e => { e.preventDefault() }}>
                            <input style={{ fontSize: '150%' }} type="file" onChange={changeImageToAdd} />
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
                <button type="submit" className="my-btn btn-outline-orange" style={{ fontSize: '150%' }}>Añadir Pista</button>
            </form>
            {/* Seccion que aparece y desaparece para poder asignar una pista */}
            {mostrarFormularioPista ?
                <div className="App" style={{ display: 'flex', justifyContent: 'center', verticalAlign: 'true' }}>
                    <textarea style={{ marginLeft: '0.5%', resize: "none", textAlign: "center" }} rows={3} cols={50} maxLength={100} onChange={(e) => { updatePista(e.target.value) }} placeholder="Pista que el jugador puede recibir" defaultValue={pista} />
                </div>
                : null}
        </div>
    )
};
export default ImageTarget;