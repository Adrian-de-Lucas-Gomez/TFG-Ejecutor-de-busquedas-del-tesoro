import React, { Fragment, useState } from "react"

export const ToDoList = () =>{

    interface ToDoElement{
        text: string;
        complete: boolean;
    }

    /*
    interface ToDoElementChild extends ToDoElement{
        number: number;
    }
    */
    
    type FormElement = React.FormEvent<HTMLFormElement>;
    const [state, setState] = useState<string>("");
    const [toDos, setToDos] = useState<ToDoElement[]>([]);

    //Metodo para que cada vez que hagamos un submmit, dejemos limpia
    //la barra del texto
    const handleSummit = (e:FormElement):void =>{
        e.preventDefault();
        addToDo(state);
        setState("");
    }

    const addToDo = (text:string):void =>{
        //MINE:
        //toDos.push({text, complete:false})
        setToDos([...toDos, {text, complete:false}]);
    }

    const checkTask = (index:number):void =>{
        //MINE:
        //toDos[index].complete = !toDos[index].complete;
        //setToDos([...toDos]);

        const newToDos: ToDoElement[] = [...toDos];
        newToDos[index].complete = !newToDos[index].complete;
        setToDos(newToDos);
    }

    const removeToDo = (index:number): void =>{
        const newToDos: ToDoElement[] = [...toDos];
        newToDos.splice(index, 1);
        setToDos(newToDos);
    }

    return (<div>
       <h2>Lista de tareas pendientes:</h2>
       <form onSubmit={handleSummit}>
           <input className="form-control" type="text" required value={state} onChange ={ e =>setState(e.target.value)}></input>
           <button className="btn btn-outline-primary mt-2" type="submit">Add ToDo</button>
       </form>
       <section>
           {toDos.map((toDo: ToDoElement, index:number) => (
           <Fragment key={"ToDo" + index}>
               <div className="text-md-left" style={{textDecoration: toDo.complete ? "line-through" : " "}}>{toDo.text}</div>
               <button className="btn btn-outline-primary mt-2" onClick = {():void => checkTask(index)}>
                   <div>{!toDo.complete ? "Completada" : "Pendiente"}</div>
               </button>
               <button className = "btn btn-outline-primary mt-2" onClick={():void => removeToDo(index)}>Erase task</button>
           </Fragment>
            ))}
       </section>
    </div>)
}