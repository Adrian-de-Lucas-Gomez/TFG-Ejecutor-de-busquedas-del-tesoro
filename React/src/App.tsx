import {Event} from "./Components/Event"
import {Fragment, useState} from "react"

function App() {

  //Array con los eventos de la gymncana
  const [eventList, setEventList] = useState<([number,JSX.Element])[]>([])
  
  //Para que react sepa que elementos tiene que identificar utiliza las keys para identificar los JSX.elements
  //(ver el render y el pintado del eventList), estos ids tienen que ser unicos y deben ser persistentes 
  //(es decir, que si quitamos y metemos elementos no podemos usar el indice)
  //Por tanto para solucionar eso, me creo una variable a modo de contador para que dada vez que añadamos
  //un evento tenga un identificador numerico unico
  const [eventCounter, setEventCounter] = useState<number>(0) 

  //Añadir evento a la lista
  const addEvent = ():void =>{
    setEventList([...eventList,[ eventCounter,<Event/>]]);
    setEventCounter(eventCounter + 1);
  }

  //Setteamos la lista con todos los elementos que contenia menos aquel con el identificador id
  const deleteEvent = (id:number):void => {
    setEventList(eventList.filter(elem => elem[0] !== id));
  }

  const generateJSON = ():void =>{
    console.log("Generamos JSON con la gymncana")
    console.log("Falta implementar")
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
    </div>
  );
}

export default App;
