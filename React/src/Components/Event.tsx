import {useState} from "react"
import {Quiz} from "./Quiz"
import {QR} from "./Qr"

export const Event = () =>{
    const [elemToRender, setElemToRender] = useState<JSX.Element | null>(null);
    
    const UpdateSelector = (evt: React.FormEvent<HTMLSelectElement>):void => {
        evt.preventDefault()
        let s:string = evt.currentTarget.value;
        if(s === "QR") setElemToRender(<QR/>)
        else if(s === "Quiz") setElemToRender(<Quiz/>)
        else if(s === "Default") setElemToRender(null)
    };

    return (
        <div>
            <select id="Selector" className="form-select" onChange={ UpdateSelector} >
                <option value="Default">Default</option>
                <option value="QR">QR</option>
                <option value="Quiz">Quiz</option>
            </select>
            {elemToRender !== null ? elemToRender : ""}
        </div>
    )
}
