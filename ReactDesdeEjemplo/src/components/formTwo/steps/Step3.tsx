import { StepComponentProps } from '../../Steps';

// paso adicional para mostrar un resumen del formulario
// aquí los hobbies van a salir "feos" porque hacemos una conversión forzada a string
const Step3 = (props: StepComponentProps): JSX.Element => {

  const properties = Object.keys(props.state).map(key => ({ key: key, value: props.state[key] }));

  return (
    <div className='step'>
      <h3>{props.title}</h3>
      {properties.map(({ key, value }) => (
        <>
          <h4>{key}</h4>
          <p>{value as string}</p>
        </>
      ))}
      <br />
      {props.hasPrev() && <button onClick={props.prev}>Prev</button>}
      {props.hasNext() && <button onClick={props.next}>Next</button>}
    </div>
  );
};

export default Step3;