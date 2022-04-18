import React, { Fragment, useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { StepComponentProps } from '../Steps';
import swal from "sweetalert";
import Errorimage from "../../imgCards/Imagen.png"

const InputText = (props: StepComponentProps): JSX.Element => {
    //Donde guardamos el texto a codificar en QR
    const [texts, setTexts] = useState<string[]>([]);
    const [description, setDescription] = useState<string>("");
    const [currText, setCurrText] = useState<string>("")
    const [sobreEscribir, setSobreEscribir] = useState<boolean>(false);

    const [mostrarFormularioPista, setMostrarFormularioPista] = useState<boolean>(false);
    const [pista, setPista] = useState<string>("");

    const addText = (text: string): void => {
        const newTexts = [...texts, text];
        setTexts(newTexts);
    }


    const removeText = (index: number): void => {
        const newAnswers: string[] = [...texts];
        newAnswers.splice(index, 1);
        setTexts(newAnswers);
    }

    const handleNewText = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        addText(currText);
        setCurrText("");
    }

    useEffect(() => {

        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if (props.getState<boolean>('SobreEscribir', false)) {

            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []);
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable', 1)];
            //Me guardo tando la pregunta como las respuestas que había configuradas
            setTexts(estadoACargar.Respuestas);
            setDescription(estadoACargar.description);
            setPista(estadoACargar.Pista);

            //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
            let myData = { Alert: ((description==="") || (texts.length<1)), MensageAlert: "La fase de input debe tener una descripción no vacía y al menos una contraseña a escribir", datosFase: estadoACargar };
            props.setState<any>('faseConfigurandose', myData, {});
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => { }
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [props.getState<boolean>('SobreEscribir', false)]);

    //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se veab
    useEffect(() => {
        let jsonData = { tipo: "InputTextStage", Respuestas: texts, description: description, Pista: pista };
        let myData = { Alert: ((description==="") || (texts.length<1)), MensageAlert: "La fase de input debe tener una descripción no vacía y al menos una contraseña a escribir", datosFase: jsonData };
        props.setState<any>('faseConfigurandose', myData, {});
        console.log("Ahora el estado es asi: " + JSON.stringify(jsonData));

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => { }
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [pista, texts, description]);



    const updatePista = (nuevaPista: string) => {
        setPista(antigua => antigua = nuevaPista);
    }

    const tutorialFase = () => {
        swal({ title: "InputText", text: "En esta fase puedes configurar una constraseña que el jugador tiene que introducir para pasar a la siguiente, también puedes configurar una descripción para hacerle preguntas al jugador y que escriba la respuesta o para ayudarle a buscar en su entorno para descifrarla.", icon: Errorimage });
    }

    return (
        <div>
            <div className="flex" style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                <h3 style={{ marginTop: '0.5%', marginBottom: '1%', fontSize: '200%' }} className="Titulo" >Configuración de fase InputText</h3>
                <button style={{ width: "40px", height: "40px", textAlign: "center", verticalAlign: "center", background: "white", marginTop: "20px", marginRight: "2px", color: "white", padding: "10px", borderRadius: "50%" }} type="button" className="btn" onClick={tutorialFase} >{"💡"}</button>
            </div>            <form className="center" style={{ marginBottom: '1%' }} onSubmit={e => e.preventDefault()}>
                <text style={{ fontSize: '150%', marginRight: '0.5%' }} className='Titulo' >Descripción de la contraseña a encontrar:</text>
                <input placeholder="Añada aqui la descripción..." className='input-text' type="text" size={60} required value={description} onChange={e => { setDescription(e.target.value); }}></input>
            </form>

            <form className="center" style={{ marginBottom: '1%' }} onSubmit={e => handleNewText(e)}>
                <text style={{ fontSize: '150%', marginRight: '0.5%' }} className='Titulo' >Contraseña a encontrar:</text>
                <input placeholder="Añada aqui la contraseña..." className='input-text' type="text" size={60} required value={currText} onChange={e => setCurrText(e.target.value)}></input>
                <button style={{ marginLeft: '0.3%' }} className="my-btn btn-outline-orange" type="submit">Añadir contraseña</button>
            </form>

            <h2 style={{ marginTop: '0.5%', marginBottom: '1%', fontSize: '180%' }} className="Titulo">Descripción actual: {description}</h2>

            <text style={{ fontSize: '150%', marginLeft: '20%' }} className='Titulo' >Contraseñas que permitiremos al usuario:</text>
            <div>
                {texts.map((txt: string, index: number) => (
                    <Fragment key={"Textos: " + index}>
                        <div>
                            <button className="my-btn btn-outline-red" style={{ marginLeft: '5%' }} onClick={(): void => removeText(index)}>Borrar contraseña</button>
                            <text className="Titulo" style={{ fontSize: '130%', marginLeft: '1%', textAlign: "left" }}>{txt + "\n"}</text>
                        </div>
                    </Fragment>
                ))}
            </div>

            {/* Seccion pista */}
            {/* Boton para desplegar elementos para añadir una pista */}
            <form style={{ textAlign: 'center' }} onSubmit={(e) => { e.preventDefault(); setMostrarFormularioPista(!mostrarFormularioPista); }}>
                <button type="submit" className="my-btn btn-outline-orange" style={{ fontSize: '150%' }}>Añadir Pista</button>
            </form>
            {/* Seccion que aparece y desaparece para poder asignar una pista */}
            {mostrarFormularioPista ?
                <div className="App" style={{ display: 'flex', justifyContent: 'center', verticalAlign: 'true' }}>
                    <span>
                        <b>Pista de la fase:</b>
                    </span>
                    <textarea style={{ marginLeft: '0.5%', resize: "none", textAlign: "center" }} rows={3} cols={50} maxLength={100} onChange={(e) => { updatePista(e.target.value) }} placeholder="Pista que el jugador puede recibir" defaultValue={pista} />
                </div>
                : null}
        </div>
    )
};
export default InputText;