import { queries } from "@testing-library/react";
import { StepComponentProps } from '../Steps';
import React, {Fragment, useState, useEffect  } from "react"
import { createSemicolonClassElement } from "typescript";
import '../Styles/Quiz.css'

  

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

    const [sobreEscribir, setSobreEscribir] = useState<boolean>(false);

    
    useEffect(() => {

        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if(props.getState<boolean>('SobreEscribir', false)){

            //Indico que ya no es necesario sobreescribir nada, porque ya nos encargamos
            setSobreEscribir(true);
            props.setState('SobreEscribir', false, false);

            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []); 
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable',1)]; 


            //Me guardo tando la pregunta como las respuestas que había configuradas
            setQuestion(estadoACargar.Pregunta);

            //Cargo todas las respuestas que había almacenadas en el estado a configurar
            let futurasRespuestas:Answer[] = [];
            for(let i = 0; i < estadoACargar.Respuestas.length;i++){
                futurasRespuestas.push((estadoACargar.Respuestas[i] as Answer));
            }
            setAnswers(futurasRespuestas);
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, [props.getState<boolean>('SobreEscribir', false)]);
    
    //const [quizAddFunction, setFuncion] = useState<Function>(props.funcion);
    const [index, setIndex] = useState(props.order);

        
    const modifyQuestion = (e:string):void =>{        
        setQuestion(e);
    }


    const handleNewQuestion = (e:FormElement):void =>{
        e.preventDefault();
        addAnswer(currAnswer);
        setCurrAnswer("");
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
            let new_state = props.getState<any>('DATA', []); 
            //Preparo el diccionario que voy a meter en el registro
            let myData = {tipo:"QuizStage" ,Pregunta: question, Respuestas: answers};

            console.log("Sobreescribir es igual a "+sobreEscribir);
            if(sobreEscribir === true){
                //De esta forma se puede meter el estado en unaposicion concreta en lugar de hacerlo en el final siempre
                let position = props.getState<number>('FaseConfigurable',1);
                new_state.splice(position,1,myData);
            }
            //Si no hay que sobreescribir nada simplemente pusheamos al final de los datos
            else {
                //Lo almaceno en la lista de fases que tengo disponibles
                let position = props.getState<number>('WhereToPush',1);
                new_state.splice(position, 0, myData);
            }


            //Y tras modificar la copia del registro para que me contenga pongo esta copia como el registro de la aventura
            props.setState('DATA',new_state,[]);

            //Importante aumentar el indice de donde estamos metiendo nuevos elementos a la aventura para que no 
            //se metan todos en la posicion X y que luego estén TODOS EN ORDEN INVERSO
            props.setState<number>('WhereToPush',props.getState<number>('WhereToPush',1)+1,1);
        }
        else{
            alert("Rellena bien");
        }
    }

    return (
        <div>
            <h2 className="Titulo"  >Configuracion de evento de quiz:</h2>
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
                <button className='SaveButton' type="submit">Guardar Fase</button>
            </form>
        </div>
    )

};

export default Quiz;