import { queries } from "@testing-library/react";
import { StepComponentProps } from '../../Steps';
import React, {Fragment, useState, useEffect  } from "react"
import { createSemicolonClassElement } from "typescript";

  

const Quiz = (props: StepComponentProps): JSX.Element => {

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

    
    
    //const [quizAddFunction, setFuncion] = useState<Function>(props.funcion);
    const [index, setIndex] = useState(props.order);
    

    //Nada mas montarme le pregunto al contenedor si ya existe el array en el que se van a almacenar todos los datos
    //si NO existe lo creamos
    useEffect(() => {
        //Le digo que me de el valor de DATA y un valor por defecto en caso de NO encontrarlo, si obtengo el valor por defecto 
        //le asigno el un valor inicial
        if(props.getState<string>('DATA', "") === ""){}

      }, []); 

        
    const modifyQuestion = (e:string):void =>{
        setQuestion(e);
        // props.setState<string>('firstname', "Hola", '')

        // //ME hago con el estado actual del array de info de la aventura
        // let new_state = props.getState<string>('DATA', '{nombre: "hola"}'); 
        // var casteado = {nombre:"Hola a todos", fases:[{}] };
        // casteado.fases[props.order] = {pregunta:"Hola a todos"};
        // var vueltaAString = JSON.stringify(casteado); 
        // console.log(vueltaAString);
        // props.setState<string>('DATA',vueltaAString,"");
    }


    const handleNewQuestion = (e:FormElement):void =>{
        e.preventDefault();
        addAnswer(currAnswer);
        setCurrAnswer("");
    }


    const DataParaJSON = (): {} => {
        var myData = {Pregunta: question, Respuestas: answers, indi: index};
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


    //Metodo utilizado para guardar los datos que actuales del
    //quiz en el registro de fases actual de la aventura
    const guardaFase = (e:FormElement) => {
        //Para que no se refresque la pagina en el onSubmit
        e.preventDefault()
        if (question !== "" && answers.length >= 2 && answers.length <= 6){

            //ME hago con el estado actual del array de info de la aventura
            let new_state = props.getState<[{}]>('DATA', [{}]); 
            //Preparo el diccionario que voy a meter en el registro
            let myData = {tipo:"QuizStage" ,Pregunta: question, Respuestas: answers};

            //Lo almaceno en la lista de fases que tengo disponibles
            new_state.push(myData);
            console.log(new_state);
            
            //Y tras modificar la copia del registro para que me contenga pongo esta copia como el registro de la aventura
            props.setState('DATA',new_state,[{}]);
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
                <input className="form-control" type="text" required value={question} onChange ={ e =>modifyQuestion(e.target.value)}></input>
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
            <form onSubmit= {guardaFase}>
                <button className="btn btn-outline-primary mt-2" type="submit">Guardar Fase</button>
            </form>
        </div>
    )

};

export default Quiz;