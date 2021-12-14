import Event from "./Components/Event"
import {Fragment, useState} from "react"

function App() {

  //Esto es como un using en c++
  type FormElement = React.FormEvent<HTMLFormElement>;

  //Array con los eventos de la gymncana
  const [eventList, setEventList] = useState<([number,JSX.Element])[]>([])
  const [eventsFunctions, setEventsFunctions] = useState<Function[]>([]);

  
  //Para que react sepa que elementos tiene que identificar utiliza las keys para identificar los JSX.elements
  //(ver el render y el pintado del eventList), estos ids tienen que ser unicos y deben ser persistentes 
  //(es decir, que si quitamos y metemos elementos no podemos usar el indice)
  //Por tanto para solucionar eso, me creo una variable a modo de contador para que dada vez que añadamos
  //un evento tenga un identificador numerico unico
  const [eventCounter, setEventCounter] = useState<number>(0) 

  
  //Setteamos la lista con todos los elementos que contenia menos aquel con el identificador id
  const deleteEvent = (id:number):void => {
    setEventList(eventList.filter(elem => elem[0] !== id));
  }
  
  const generateJSON = ():void =>{
    console.log("Generamos JSON con la gymncana")
    console.log("Falta implementar")
  }
  
  //Añadir evento a la lista
  const addEvent = ():void =>{
    setEventList([...eventList,[ eventCounter,<Event foo = {()=> AddFunctionFromEvent }/>]]);
    setEventCounter(eventCounter + 1);
  }

  const downloadFile = ( data:string, fileName:string, fileType:string ) => {
    // Create a blob with the data we want to download as a file
    const blob = new Blob([data], { type: fileType })
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
    const a = document.createElement('a')
    a.download = fileName
    a.href = window.URL.createObjectURL(blob)
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    a.dispatchEvent(clickEvt)
    a.remove()
}

///Funcion que van a llamar los diferentes eventos para informar de la funcion que tiene cada evento para genrear su parte del json
function AddFunctionFromEvent(newFunction:Function) {
  eventsFunctions.push(newFunction);
} 

//Para exportar los datos a un JSON lo que hago es preparar un array, y en este array voy a meter las cosas que me vayan dando los eventos
const exportToJson = (e:FormElement) => {
    //Para que no se refresque la pagina en el onSubmit
    e.preventDefault()

    //Arrat de info de cada evento
    var datos= []
    for(let i =0;i<eventCounter;i++){
      datos.push(eventsFunctions[i]());
    }
    //Una vez que tengo los datos de cada evento, preparo un JSON y lo descargo
    var jsonFinal = {Gencana: "Nombre", fases: datos}
    downloadFile(JSON.stringify(jsonFinal, null, 2),'answers.json','text/json')
}

  return (
    <div className="App">
      <h1>Configuración de Gymncana</h1>
      <>
        {eventList.map((event: [number, JSX.Element], index:number) => (
          <Fragment key={event[0].toString()}>
            <h2>Evento {index}:</h2>
            {event[1]}
            <button className = "btn btn-outline-danger mt-2" onClick={():void => deleteEvent(event[0])}>Borrar Evento</button>
          </Fragment>
        ))}
      </>
      <div>
        <button className = "btn btn-outline-primary mt-2" onClick={():void => addEvent()}>Añadir evento</button>
        {
          eventList.length > 0 ? 
            <button className = "btn btn-outline-primary mt-2" onClick={():void => generateJSON()}>Generar gyncana</button>:
            ""
        }
      </div>
      <form onSubmit= {exportToJson}>
                <button className="btn btn-outline-primary mt-2" type="submit">Creame un JSON hijo mio</button>
            </form>
    </div>
  );
}

export default App;
