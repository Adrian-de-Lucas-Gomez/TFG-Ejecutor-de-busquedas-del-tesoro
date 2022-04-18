import { StepComponentProps } from '../Steps';
import React, {Fragment, useState, useEffect  } from "react"
import '../Styles/Quiz.css'
import { json } from 'stream/consumers';
import swal from "sweetalert";
import Errorimage from "../../imgCards/Imagen.png"

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
    
    const [mostrarFormularioPista, setMostrarFormularioPista] =useState<boolean>(false);
    const [pista, setPista] = useState<string>("");


    useEffect(() => {
        // let info = {Alert: true, MensageAlert: "Quiz debe tener una pregunta y al menos 2 respuestas posibles", datosFase: {} };
        // props.setState<any>('faseConfigurandose',info,{});
        //En caso de que haya que sobreescribir algo, me guardo que estamos sobreescribiendo y cargo 
        //los datos que ya había de esta fase      
        if(props.getState<boolean>('SobreEscribir', false)){

            //Me quedo con lo que haya que sobreescribir
            let new_state = props.getState<any>('DATA', []); 
            let estadoACargar = new_state[props.getState<number>('FaseConfigurable',1)]; 

            //Nos aseguramos que lo que se esta configurando ahora es lo que nos hemos cargado
            let myData = {Alert: ((question ==="")||(answers.length<2)), MensageAlert: "El quiz debe de tener una pregunta y al menos 2 respuestas", datosFase: estadoACargar };
            props.setState<any>('faseConfigurandose',myData,{});

            //Me guardo tando la pregunta como las respuestas que había configuradas
            setQuestion(estadoACargar.Pregunta);

            //Cargo todas las respuestas que había almacenadas en el estado a configurar
            let futurasRespuestas:Answer[] = [];
            for(let i = 0; i < estadoACargar.Respuestas.length;i++){
                futurasRespuestas.push((estadoACargar.Respuestas[i] as Answer));
            }
            setAnswers(futurasRespuestas);
            setPista(estadoACargar.Pista);
        }

        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, [props.getState<boolean>('SobreEscribir', false)]);

  //Hook que se llama cada vez que se modifica algo significativo de la fase para guardar lo que tengamos y que al darle a guardar los cambios se veab
      useEffect(() => {
        let jsonData = {tipo:"QuizStage" ,Pregunta: question, Respuestas: answers,Pista:pista};
        let myData = {Alert: ((question ==="")||(answers.length<2)), MensageAlert: "El quiz debe de tener una pregunta y al menos 2 respuestas", datosFase: jsonData };
        props.setState<any>('faseConfigurandose',myData,{});
    
        //Este cógigo se ejecuta EXCLUSIVAMENTE cuando se va a desmontar el componente
        return () => {}
        //Si algo cambia en le tema de sobreescribir nos actualizamos para poder adquirir los datos de la fase a RECONFIGURAR
      }, [pista, question,answers]);
    
    

    
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
        const newAnswers =[...answers, {text, isCorrect:false}];
        setAnswers(newAnswers);
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

    const updatePista = (nuevaPista:string) =>{
        setPista(nuevaPista);
    }


    const tutorialFase = ()=>{
        swal({ title: "Quiz", text: "En esta fase puedes configurar un quiz que el jugador debe responder correctamente para completarla, debes de introducir al menos 2 respuestas posibles y pueden haber múltiples respuestas correctas, en cuyo caso el jugador debe de responder a todas correctamente",  icon: Errorimage });
    }

    return (
        <div>
            <div className="flex" style = {{display:"flex", flexDirection:"row", justifyContent:"center"  }}>
                <h3 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'200%'}} className="Titulo" >Configuración de fase Quiz</h3>
                <button style={{width:"40px", height:"40px",textAlign:"center",verticalAlign:"center", background:"white", marginTop: "20px",marginRight:"2px",  color: "white", padding: "10px", borderRadius:"50%"}} type="button" className="btn" onClick={tutorialFase} >{"💡"}</button>
            </div>
            
            <div className="center">
                <form onSubmit={e => e.preventDefault()}>
                    <input placeholder="Pregunta del cuestionario..." className='input-text' type="text" size={60} required value={question} onChange ={ e =>modifyQuestion(e.target.value)}></input>
                </form>
            </div>
            <h2 style={{marginTop:'0.5%',marginBottom:'1%',fontSize:'180%'}} className="Titulo">Pregunta actual: {question}</h2>

            <form  style={{marginBottom:'1%'}} className="center" onSubmit={handleNewQuestion}>
                <input placeholder="Respuesta posible..." className='input-text' type="text" size={60} required value={currAnswer} onChange={e =>setCurrAnswer(e.target.value)}></input>
                <button style={{marginLeft:'0.3%'}} className="my-btn btn-outline-orange" type="submit">Añadir respuesta</button>
            </form>

            <div>
                {answers.map((answer: Answer, index:number) => (
                <Fragment key={"Respuesta: " + index}>
                <div>
                    <button className = "my-btn btn-outline-red" style={{marginLeft:'20%'}} onClick={():void => removeAnswer(index)}>Borrar respuesta</button> 
                    <text className="Titulo" style={{fontSize:'130%', marginLeft:'1%'}}>{!answer.isCorrect ? "Incorrecta" : "Correcta"}</text>     
                    <input style={{marginLeft:'1%'}} type="checkbox" className="btn-check" id="btn-check-outlined" autoComplete="off" onClick = {():void => setAnswerAsCorrect(index)}></input>
                    <text className="Titulo" style={{fontSize:'130%', marginLeft:'1%'}}>{answer.text}</text>
                </div>
                </Fragment>
                ))}
            </div>     

            {/* Sªeccion pista */}
            {/* Boton para desplegar elementos para añadir una pista */}
            <form style={{textAlign:'center'}} onSubmit= {(e)=>{e.preventDefault(); setMostrarFormularioPista(!mostrarFormularioPista);}}>
                <button type="submit" className="my-btn btn-outline-orange" style={{fontSize:'150%'}}>Añadir Pista</button>
            </form>
            {/* Seccion que aparece y desaparece para poder asignar una pista */}
            {mostrarFormularioPista ? 
            <div className="App" style={{display: 'flex', justifyContent: 'center', verticalAlign:'true'}}>
            <textarea style={{marginLeft:'0.5%' ,resize:"none", textAlign:"center"}} rows={3} cols={50} maxLength={100} onChange={(e) => {updatePista(e.target.value)}} placeholder="Pista que el jugador puede recibir" defaultValue={pista}/>
            </div>
            : null }  
        </div>
    )

};

export default Quiz;