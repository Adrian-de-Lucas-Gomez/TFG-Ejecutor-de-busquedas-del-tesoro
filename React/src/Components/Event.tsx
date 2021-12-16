import {forwardRef, RefObject, useState} from "react"
import {Quiz} from "./Quiz"
import {QR} from "./Qr"
import { isConstructorDeclaration } from "typescript";


const  Event = forwardRef((props:{foo: Function,camb:Function,b:number, indice :number }, ref) =>{
    const [elemToRender, setElemToRender] = useState<JSX.Element | null>(null);
    const [tipeOfFase, setTypeOffase] = useState<string>();

    //Funcion de la App a la que vamos a mandar otras funciones que generen las diferentes partes del JSON
    const [func, setFuncion] = useState<Function>(props.foo);
    const [indice, setIndice] = useState<number>(0);

    const UpdateSelector = (evt: React.FormEvent<HTMLSelectElement>):void => {
        evt.preventDefault()
        let s:string = evt.currentTarget.value;
        if(s === "QR"){ setElemToRender(<QR funcion = {props.foo} ref = {ref}/>); setTypeOffase("QR")}
        else if(s === "Quiz") {setElemToRender(<Quiz funcion = {props.foo} cambio = {props.camb} b ={props.b} indice = {props.indice} ref={ref} />);setTypeOffase("Quiz")}
        else if(s === "Default") {setElemToRender(null);setTypeOffase("")}
    };



     const getFase = ():{} => {
        let coso = {}
        if(tipeOfFase === "QR") coso = {Tipo:"Qr",Adios:"10000"}
        else if(tipeOfFase === "Quiz") coso = {Tipo:"Quiz",Hola:"2"}
        else if(tipeOfFase === "") coso = {}
        return coso;
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
});

export default Event;
