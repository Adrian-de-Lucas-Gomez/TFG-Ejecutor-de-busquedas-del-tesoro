import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import {Fragment, useState, useRef} from "react"
import NavigationComponent from './components/navigation/NavigationComponent';
import { State, StepsConfig, Steps, Step } from './components/Steps';
import Quiz from './components/steps/Quiz'
import QR from './components/steps/Qr'
import ImageCharger from './components/steps/ImageCharger';
import ImageTarget from './components/steps/ImageTarget';
import './components/Styles/App.css'

const App = (): JSX.Element => {


  const [state, setState] = useState<State>({
    adventureName: 'Nombre por defecto',
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
      <h2 className='Titulo' >Configuración de Gymncana</h2>
      <Steps config={config} genState={state} setGenState={setState}>
        <Step title='QR' component={QR} />
        <Step title='Quiz' component={Quiz} />
        <Step title='ImageCharger' component={ImageCharger}/>
        <Step title='ImageTarget' component={ImageTarget}/>
      </Steps>

    </div>
  );
};

export default App;
