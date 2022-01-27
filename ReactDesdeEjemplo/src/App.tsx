import { BrowserRouter, Route, Routes } from 'react-router-dom';
import FormOne from './components/formOne';
import FormTwo from './components/formTwo';

const App = (): JSX.Element => {

  return (
    <>
      <h1>Demo de formularios por pasos</h1>
      <p>Prueba a utilizar diferentes rutas:</p>
      <li>
        <ul>Ruta 1: <a href='/formulario-uno'>/formulario-uno</a></ul>
        <ul>Ruta 2: <a href='/formulario-dos'>/formulario-dos</a></ul>
      </li>
      <p>El contenido se cargará a continuación:</p>
      <RoutesComponent />
    </>
  );
};

const RoutesComponent = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/formulario-uno' element={<FormOne />} />
        <Route path='/formulario-dos' element={<FormTwo />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
