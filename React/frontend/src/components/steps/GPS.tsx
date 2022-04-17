import React, { useState, useEffect } from "react"
import { StepComponentProps } from '../Steps';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import '../Styles/MapContainer.css'


const GPS = (props: StepComponentProps): JSX.Element => {
    //Donde guardamos el texto a codificar en GPS
    const [GPSLongitude, setGPSLongitude] = useState<number>(40.453003);
    const [GPSLatitude, setGPSLatitude] = useState<number>(-3.733825);
    const [radius, setradius] = useState<number>(10.0);
    const [description, setdescription] = useState<string>("");
    const [markers, setMarkers] = useState([40.453003, -3.733825]);
    type FormElement = React.FormEvent<HTMLFormElement>;
    const [sobreEscribir, setSobreEscribir] = useState<boolean>(false);

    const [mostrarFormularioPista, setMostrarFormularioPista] =useState<boolean>(false);
    const [pista, setPista] = useState<string>("");


    useEffect(() => {
        // let info = {Alert: true, MensageAlert: "Rellena bien el texto del GPS", datosFase: {} };
        // props.setState<any>('faseConfigurandose',info,{});

        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if (props.getState<boolean>('SobreEscribir', false)) {

            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []);
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable', 1)];
            //Me guardo tando la pregunta como las respuestas que había configuradas
            setGPSLongitude(estadoACargar.GPSLongitude);
            setGPSLatitude(estadoACargar.GPSLatitude);
            setradius(estadoACargar.radius);
            setdescription(estadoACargar.description);
            setMarkers([estadoACargar.GPSLatitude,estadoACargar.GPSLongitude])

            setPista(estadoACargar.Pista);


            //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
            let myData = { Alert: false, MensageAlert: "", datosFase: estadoACargar };
            props.setState<any>('faseConfigurandose', myData, {});
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => { }
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [props.getState<boolean>('SobreEscribir', false)]);

    //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se veab
    useEffect(() => {
        let jsonData = { tipo: "GPSStage", GPSLongitude: GPSLongitude, GPSLatitude: GPSLatitude, radius: radius, description: description, Pista:pista };
        let myData = { Alert: false, MensageAlert: "Rellena bien los parámetros de la fase", datosFase: jsonData };
        props.setState<any>('faseConfigurandose', myData, {});
        console.log("Ahora el estado es asi: "+JSON.stringify(jsonData));
    
        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, [pista, GPSLongitude,GPSLatitude,radius, description]);
    

    const updatePista = (nuevaPista:string) =>{
        setPista(nuevaPista);
    }


    const LocationMarker = () => {
        const map = useMapEvents({
            click(e: any) {
                setMarkers(e.latlng);
                setGPSLongitude(e.latlng.lng);
                setGPSLatitude(e.latlng.lat);
                console.log("Market lng: " + (markers[1]) + " lat: " + (markers[0]));
                console.log("Market REAL lng: " + (e.latlng.lng) + " lat: " + (e.latlng.lat));
            }
        })

        return (
            <>
                <Marker position={markers}>
                    <Popup>
                        <pre>
                            {"Latitude: "+ GPSLatitude.toFixed(6) + "\n" +"Longitude: "+ GPSLongitude.toFixed(6)}
                        </pre>
                        
                    </Popup>
                </Marker>

            </>
        )
    }


    return (
        <div >
            <h3 style={{ marginTop: '0.5%', marginBottom: '1%', fontSize: '200%' }} className="Titulo" >Configuración de fase geoposicionada</h3>

            <div className="center">
                <MapContainer center={[GPSLongitude, GPSLatitude]} zoom={13}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker />
                </MapContainer>
            </div>
            {/*Texto para el radio de acción*/}
            <form className="center" style={{marginTop:'0.5%', marginBottom: '1%' }} onSubmit={e => e.preventDefault()}>
                <text style={{ fontSize: '150%' , marginRight:'0.5%'}} className='Titulo' >Distancia de detección de llegada a destino:</text>
                <input placeholder="metros" className='input-text' type="number" size={30} required value={radius} onChange={e => { setradius(e.target.value as unknown as number)}}></input>
            </form>

            {/*Texto para la descripcion de a donde debes llegar*/}
            <form className="center" style={{ marginBottom: '1%' }} onSubmit={e => e.preventDefault()}>
                <text style={{ fontSize: '150%' , marginRight:'0.5%'}} className='Titulo' >Descripción:</text>
                <input placeholder="Texto para indicar al usuario que debe buscar" className='input-text' type="text" size={60} required value={description} onChange={e => {setdescription(e.target.value)}}></input>
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
export default GPS;