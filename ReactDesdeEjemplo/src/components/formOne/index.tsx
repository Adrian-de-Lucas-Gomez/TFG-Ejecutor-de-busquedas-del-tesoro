import {Fragment, useState, useRef} from "react"
import NavigationComponent from '../navigation/NavigationComponent';
import { State, StepsConfig, Steps, Step } from '../Steps';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Quiz from './steps/Quiz';
import QR from './steps/Qr';

export const FormOne = (): JSX.Element => {

  const [state, setState] = useState<State>({
    firstname: 'Nombre por defecto',
    lastname: 'Apellido por defecto'
  });

  const config: StepsConfig = {
    navigation: {
      component: NavigationComponent,
      location: 'before',
    }
  };



  return (
    <div className='steps_wrapper'>
      <h2>Este es el formulario uno.</h2>
      <p>Contiene dos pasos y almacena información relativa a nombre y apellido (paso 1), edad y lista de hobbies (paso 2).</p>
      <Steps config={config} genState={state} setGenState={setState}>
      <Step title='QR' component={QR} />
      <Step title='Quiz' component={Quiz} />
      </Steps>

    </div>
  );
};

export default FormOne;