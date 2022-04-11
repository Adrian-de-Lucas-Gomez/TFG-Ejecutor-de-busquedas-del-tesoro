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


            //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
            let myData = { Alert: false, MensageAlert: "", datosFase: estadoACargar };
            props.setState<any>('faseConfigurandose', myData, {});
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => { }
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
    }, [props.getState<boolean>('SobreEscribir', false)]);


    const prepareForSave = (UIlongitude: number, UIlatitude: number, UIradius: number, UIdescription: string) => {
        setGPSLongitude(UIlongitude);
        setGPSLatitude(UIlatitude);
        setradius(UIradius);
        setdescription(UIdescription);

        let jsonData = { tipo: "GPSStage", GPSLongitude: UIlongitude, GPSLatitude: UIlatitude, radius: UIradius, description: UIdescription };
        let myData = { Alert: false, MensageAlert: "Rellena bien los parámetros de la fase", datosFase: jsonData };
        props.setState<any>('faseConfigurandose', myData, {});
    }
    const LocationMarker = () => {
        const map = useMapEvents({
            click(e: any) {
                setMarkers(e.latlng);
                prepareForSave(e.latlng.lng, e.latlng.lat, radius, description);
                console.log("Market lng: " + (markers[1]) + " lat: " + (markers[0]));
                console.log("Market REAL lng: " + (e.latlng.lng) + " lat: " + (e.latlng.lat));
            }
        })

        return (
            <>
                <Marker position={markers}>
                    <Popup>
                        <span>
                            A pretty CSS3 popup. <br /> Easily customizable.
                        </span>
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
                <input placeholder="metros" className='input-text' type="number" size={30} required value={radius} onChange={e => { prepareForSave(GPSLongitude, GPSLatitude, e.target.value as unknown as number, description); }}></input>
            </form>

            {/*Texto para la descripcion de a donde debes llegar*/}
            <form className="center" style={{ marginBottom: '1%' }} onSubmit={e => e.preventDefault()}>
                <input placeholder="Texto para indicar al usuario que debe buscar" className='input-text' type="text" size={60} required value={description} onChange={e => { prepareForSave(GPSLongitude, GPSLatitude, radius, e.target.value); }}></input>
            </form>



        </div>
    )
};
export default GPS;