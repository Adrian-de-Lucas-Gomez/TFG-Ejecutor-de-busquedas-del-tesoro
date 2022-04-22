import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import {Fragment, useState, useRef} from "react"
import NavigationComponent from './components/navigation/NavigationComponent';
import { State, StepsConfig, Steps, Step } from './components/Steps';
import Quiz from './components/steps/Quiz'
import QR from './components/steps/Qr'
import AdventureCharger from './components/steps/AdventureCharger'
import Sound from './components/steps/Sound'
import InputText from './components/steps/InputText';
import AdventureSummary from './components/steps/AdventureSummary';
import Image from './components/steps/Image';
import ImageTarget from './components/steps/ImageTarget';
import GPS from './components/steps/GPS';
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
      <h2 className='Titulo' style={{marginTop:'0.5%',marginBottom:'1%'}} >Configuración de Búsqueda del Tesoro</h2>
      <Steps config={config} genState={state} setGenState={setState}>
        <Step title='AdventureSummary' component={AdventureSummary} />
        <Step title='AdventureCharger' component={AdventureCharger} />
        <Step title='QR' component={QR} />
        <Step title='Quiz' component={Quiz} />
        <Step title='Image' component={Image}/>
        <Step title='ImageTarget' component={ImageTarget}/>
        <Step title='Sound' component={Sound} />
        <Step title='InputText' component={InputText} />
        <Step title='GPS' component={GPS}/>
      </Steps>

    </div>
  );
};

export default App;
