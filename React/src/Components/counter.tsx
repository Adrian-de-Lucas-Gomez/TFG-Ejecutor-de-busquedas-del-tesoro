import { useState } from "react"

export const Counter = () =>{

    const [counter, setCounter] = useState(0);

    const add = (num:number = 1):void => {
        setCounter(counter +num);
    }

    return (<div>
        <h3>Pseudo contador: {counter} </h3>
        <br/>
        <button className="btn btn-outline-primary mt-2" onClick={() => add()}>+1</button>
        <button className="btn btn-outline-primary mt-2" onClick={() => add(2)}>+2</button>
        <button className="btn btn-outline-primary mt-2" onClick={() =>setCounter(100)}>100</button>
    </div>)
}