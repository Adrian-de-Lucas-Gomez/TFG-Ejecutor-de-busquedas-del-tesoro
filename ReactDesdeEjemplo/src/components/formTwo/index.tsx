import { useState } from 'react';
import NavigationComponent from '../navigation/NavigationComponent';
import { State, StepsConfig, Steps, Step } from '../Steps';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';

export const FormTwo = (): JSX.Element => {

  const [state, setState] = useState<State>({});

  const config: StepsConfig = {
    navigation: {
      component: NavigationComponent,
      location: 'before',
    }
  };
  return (
    <div className='steps_wrapper'>
      <h2>Este es el formulario dos.</h2>
      <p>Contiene los mismos pasos que el uno y almacena información relativa a nombre y apellido (paso 1), edad y lista de hobbies (paso 2).</p>
      <p>En un tercer paso, muestra el estado global por pantalla.</p>
      <Steps config={config} genState={state} setGenState={setState}>
        <Step title='Nombre y apellido' component={Step1} />
        <Step
          title='Edad y lista de hobbies'
          component={Step2}
          availableHobbies={['Cantar', 'Leer', 'Correr', 'Viajar']}
        />
        <Step title='Resumen Formulario' component={Step3} />
      </Steps>
    </div>
  );
};

export default FormTwo;