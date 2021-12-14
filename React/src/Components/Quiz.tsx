import { queries } from "@testing-library/react";
import React, {Fragment, useState, useEffect } from "react"

export const Quiz = (props: {funcion:Function}) =>{

    interface Answer {
        text: string;
        isCorrect: boolean;
    }

    //Esto es como un using en c++
    type FormElement = React.FormEvent<HTMLFormElement>;

    //Donde almacenamos la pregunta
    const [question, setQuestion] = useState<string>("");
    //Array con las posibles respuestas a esa pregunta
    const [answers, setAnswers] = useState<Answer[]>([]);
    //Respuesta en proceso
    const [currAnswer, setCurrAnswer] = useState<string>("");

    
    const [quizAddFunction, setFuncion] = useState<Function>(props.funcion);


    //Este metodo es llamado cada vez que un componente de tipo QR es montado, como "Constructora"
    useEffect(() =>{
        quizAddFunction(DataForJSON);
        console.log("Acabo de añadirme");
    },[])    


    const handleNewQuestion = (e:FormElement):void =>{
        e.preventDefault();
        addAnswer(currAnswer);
        setCurrAnswer("");
    }

    //Funcion que genera algo de tipo JSON que va a pedir la App cuando vaya a generar un JSON con la aventura
    function DataForJSON(){
        console.log("Vamos a meter un quiz");
        for(let i =0; i < answers.length;i++){
            console.log("Tengo una respuesta: "+answers[i].text)
        }
        console.log("Mi pregunta:"+question);
        let myData = {Pregunta: "", Respuestas: answers};
        myData.Pregunta = question;
        myData.Respuestas = answers;
        return myData;
    }

    const addAnswer = (text:string):void =>{
        console.log("Respuesta añadida");
        setAnswers([...answers, {text, isCorrect:false}]);
    }

    const removeAnswer = (index:number): void =>{
        const newAnswers: Answer[] = [...answers];
        newAnswers.splice(index, 1);
        setAnswers(newAnswers);
    }

    const setAnswerAsCorrect = (index:number):void =>{
        const newAnswers: Answer[] = [...answers];
        newAnswers[index].isCorrect = !newAnswers[index].isCorrect;
        setAnswers(newAnswers);
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

    const exportToJson = (e:FormElement) => {
        //Para que no se refresque la pagina en el onSubmit
        e.preventDefault()

        if (question !== "" && answers.length >= 2 && answers.length <= 6){
            console.log("Llamada a export to JSON")
            downloadFile(JSON.stringify({pregunta:question, respuestas:answers}, null, 2),'answers.json','text/json')
        }
        else{
            console.log("Rellena bien")
        }
    }

    return (
        <div>
            <h2>Configuracion de evento de quiz:</h2>
            <form onSubmit={e => e.preventDefault() }>
                <h3>Añada aqui la pregunta del cuestionario</h3>
                <input className="form-control" type="text" required value={question} onChange ={ e =>setQuestion(e.target.value)}></input>
            </form>

            <h2>Pregunta actual: {question}</h2>

            <form onSubmit={handleNewQuestion}>
                <input className= "form-control" type="text" required value={currAnswer} onChange={e =>setCurrAnswer(e.target.value)}></input>
                <button className="btn btn-outline-primary mt-2" type="submit">Add Answer</button>
            </form>
            
            <br/>
            <br/>
            <br/>

            <section>
            {answers.map((answer: Answer, index:number) => (
            <Fragment key={"Respuesta: " + index}>
               <div className="text-md-left" style={{textDecoration: answer.isCorrect ? "underline" : " "}}>{answer.text}</div>
               <button className="btn btn-outline-primary mt-2" onClick = {():void => setAnswerAsCorrect(index)}>
                   <div>{!answer.isCorrect ? "Correcta" : "Incorrecta"}</div>
               </button>
               <button className = "btn btn-outline-danger mt-2" onClick={():void => removeAnswer(index)}>Borrar respuesta</button>
           </Fragment>
            ))}
            </section>

            <br/>
            <br/>
            <br/>
            <form onSubmit= {exportToJson}>
                <button className="btn btn-outline-primary mt-2" type="submit">Creame un JSON hijo mio</button>
            </form>
        </div>
    )

}