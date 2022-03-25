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
            <h3 style={{marginBottom:'0.5%',fontSize:'200%'}} className="Titulo" >Configuración de fase Quiz</h3>
            <div className="center">
                <form onSubmit={e => e.preventDefault()}>
                    <input placeholder="Pregunta del cuestionario..." className='input-text' type="text" size={60} required value={question} onChange ={ e =>modifyQuestion(e.target.value)}></input>
                </form>
            </div>
            <h2 style={{marginBottom:'0.5%',fontSize:'180%'}} className="Titulo">Pregunta actual: {question}</h2>

            <form className="center" onSubmit={handleNewQuestion}>
                <input placeholder="Respuesta posible..." className='input-text' type="text" size={60} required value={currAnswer} onChange={e =>setCurrAnswer(e.target.value)}></input>
                <button style={{marginLeft:'0.3%'}} className="my-btn btn-outline-orange" type="submit">Añadir respuesta</button>
            </form>

            <div>
                {answers.map((answer: Answer, index:number) => (
                <Fragment key={"Respuesta: " + index}>
                <div>
                        <button className = "my-btn btn-outline-red" style={{marginLeft:'5%'}} onClick={():void => removeAnswer(index)}>Borrar respuesta</button> 
                        <text className="Titulo" style={{fontSize:'130%', marginLeft:'1%'}}>{!answer.isCorrect ? "Incorrecta" : "Correcta"}</text>     
                        <input style={{marginLeft:'1%'}} type="checkbox" className="btn-check" id="btn-check-outlined" autoComplete="off" onClick = {():void => setAnswerAsCorrect(index)}></input>
                        <text className="Titulo" style={{fontSize:'130%', marginLeft:'1%'}}>{answer.text}</text>
                </div>
                </Fragment>
                ))}
            </div>

            <form style={{textAlign:'center'}} onSubmit= {guardaFase}>
                <button type="submit" className="my-btn btn-outline-pink" style={{fontSize:'150%', marginTop:'1%'}}>Guardar fase</button>
            </form>
            
        </div>
    )

};

export default Quiz;