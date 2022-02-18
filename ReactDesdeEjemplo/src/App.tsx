import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import {Fragment, useState, useRef} from "react"
import NavigationComponent from './components/navigation/NavigationComponent';
import { State, StepsConfig, Steps, Step } from './components/Steps';
import Quiz from './components/steps/Quiz'
import QR from './components/steps/Qr'
import ImageCharger from './components/steps/ImageCharger';
import './components/Styles/App.css'

const App = (): JSX.Element => {


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
    <a href="prueba.zip" download="CosaDescargada.zip">download cat.png</a>


      <h2 className='Titulo' >Configuración de Gymncana</h2>
      <Steps config={config} genState={state} setGenState={setState}>
      <Step title='QR' component={QR} />
      <Step title='Quiz' component={Quiz} />
      <Step title='ImageCharger' component={ImageCharger}/>
      </Steps>

    </div>
  );
};

export default App;
