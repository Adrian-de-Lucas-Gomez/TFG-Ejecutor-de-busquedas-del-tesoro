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
      <h2>Configuración de Gymncana</h2>
      <h4>Selector de fases</h4>
      <Steps config={config} genState={state} setGenState={setState}>
      <Step title='QR' component={QR} />
      <Step title='Quiz' component={Quiz} />
      </Steps>

    </div>
  );
};

export default FormOne;