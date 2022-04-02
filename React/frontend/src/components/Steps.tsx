/**
 * Gestor de secuencias de pasos, con un estado interno formado por los
 * estados parciales de cada uno de las etapas individuales. 
 * Tomado principalmente de https://github.com/sametweb/react-step-builder/blob/master/src/lib-ts/index.tsx.
 * Esta versión pretende permitir realizar cambios puntuales sobre dicho código
 * para ajustarlo a nuestras necesidades (por ejemplo para modificar de forma más
 * conveniente los tipos de datos de los formularios asociados), y disponer de una 
 * versión "comentada" donde se explique cómo funciona internamente el módulo.
 * 
 * El mayor cambio incluído aquí está destinado a reubicar el estado del formulario
 * en el componente padre (donde se declaran los pasos), y de este modo permitir el 
 * acceso al mismo desde un nivel superior al ámbito del contexto de pasos que se define aquí.
 */

import { disconnect } from "process";
import React,{ useContext, useEffect, useState}  from "react";
import { ComponentType, createContext, ReactElement } from "react";
import { json, text } from "stream/consumers";
import './Styles/Steps.css';
import axios from "axios";


//--------------------------------------------------------------
//             Definición de un Paso Concreto
//--------------------------------------------------------------

/**
 * Comenzaremos definiendo la noción de paso dentro de un listado 
 * de pasos o etapas de nuestro formulario. Notamos que una buena parte de los tipos
 * descritos a continuación hacen referencia al contexto global al que todo
 * paso tendrá acceso al estar declarado dentro de `Steps`.
 * 
 * Si se declara un paso fuera de un entorno `Steps`, el contexto recibido
 * será el que establezcamos por defecto más abajo, esencialmente un objeto
 * con un montón de valores dummies por defecto.
 */

/**
 * Lo primero que haremos será definirnos una noción de entrada en la lista de
 * pasos que gestionamos. Por el momento nos bastará con mantener información
 * relativa al nombre asignado a un paso y a su posición dentro de la lista.
 * Es importante remarcar aquí que la información de estas entradas será puramente
 * "cosmética", en el sentido de que no resultará esencial para garantizar el correcto
 * funcionamiento de los componentes/ pasos. No obstante, sí que resulta conveniente
 * para, por ejemplo, mostrar números de etapa dentro de cada componente de paso,
 * títulos que identifiquen cada uno de ellos, etc.
 */

/** Auxiliary type containing the name and the order of a given state within the context */
type StepEntry = {
  /** position of the step within the list of steps (in the context data) */
  order: number;
  /** name of the step (identifier) */
  name: string
};

/**
 * Vamos a hacer una diferenciación entre StepProps y StepComponentProps:
 * 
 * + `StepProps` se refiere a la base de la que heredarán los props de un componente `Step`,
 * que serán los únicos componentes permitidos dentro del cuerpo de un componente `Steps`. 
 * En esencia, son los props de cualquiera de las entradas de tipo
 * ```javascript
 *  <Step title="My Step" component={MyStepComponent} />
 * ```
 * con un callback opcional en `onStepLoaded` que permite especificar lógica adicional a 
 * ejecutar antes de realizar un cambio desde otro paso al paso actual (será llamado al entrar en él). 
 */
export interface BasicStepProps<T extends StepComponentProps> {
  /** Title of this step */
  title?: string;
  /** Component to be rendered as a step */
  component: ComponentType<T>;
  /** A callback function to run before step change occurs */
  onStepLoaded?: () => void;
};

export type StepProps<T extends StepComponentProps> = BasicStepProps<T> & ExclusiveStepProps<T>;

type ExclusiveStepProps<T> = Omit<T, keyof StepComponentProps>;


/**
 * + `StepComponentProps` representa la base mínima de props que deben incluir los componentes
 * que definan un paso `<Step>` dentro de un entorno `<Steps>`. Esto permite imponer una cierta
 * forma y estructura sobre los componentes empleados a modo de pasos. En el siguiente ejemplo:
 * ```javascript
 *  <Step title="My Step" component={MyStepComponent} />
 * ```
 * `MyStepComponent` deberá ser un componente de React que tome como props un tipo o interfaz que 
 * contenga, como mínimo, todos los campos especificados en la definición de `StepComponentProps`.
 * 
 * En realidad esto no supone un esfuerzo de implementación adicional desde el punto de vista de la
 * generación de pasos, puesto que basta con establecer un tipo derivado de `StepComponentProps`
 * como base de los props empleados para el paso a crear, y todas estas propiedades serán pobladas
 * automáticamente simplemente por el hecho de estar en un entorno `Steps`.
 */
export interface StepComponentProps {
  /** Order number of the current step component */
  order: number;
  /** Title of the current step component */
  title: string;
  /** Function to move to the next step */
  next: () => void;
  /** Function to move to the previous step */
  prev: () => void;
  /** Function to jump to the given step */
  jump: (step: number) => void;
  /** Function to check if the step is the first */
  isFirst: () => boolean;
  /** Function to check if the step is the last */
  isLast: () => boolean;
  /** Function to check if the step has any previous step*/
  hasPrev: () => boolean;
  /** Function to check if the step has any next step*/
  hasNext: () => boolean;
  /** Array of all available steps' title and order number*/
  stepList: StepEntry[];
  /** Combined state value of all steps */
  state: State;
  /** Function to set/update state by key */
  setState: <T>(key: string, setValue: React.SetStateAction<T>, initialValue: T) => void;
  /** Function to retrieve a state value by key */
  getState: <T>(key: string, defaultValue: T) => T;
};

/**
 * Por último, se incluye un contexto "de paso", que esencialmente se limita
 * a proporcionar información relativa al orden del paso en la secuencia de pasos.
 * Esto se pasa como contexto por no ensuciar innecesariamente los props de un 
 * elemento concreto (ver más adelante cómo se usa en Steps)
 */
interface StepContext {
  order: number;
}

export interface NavigationComponentProps extends StepsContext {
  [name: string]: unknown;
}

/**
 * Creación del contexto y determinación del valor por defecto del mismo.
 */
const StepContext = createContext<StepContext>({ order: 0 });

/**
 * Wrapper component for each individual step.
 */
function Step<T extends StepComponentProps>(props: StepProps<T>) {

  // obtención de la posición en la lista a partir del contexto
  // OJO: Aquí se asume que este contexto existirá por estar el paso
  // incluído dentro de algún `Steps`.
  const { order }: StepContext = useContext(StepContext);
  // obtención de los elementos garantizados en los props
  const { title, component, onStepLoaded } = props;
  // obtención del resto del contexto general
  const stepsContextValue: StepsContext = useContext(StepsContext);

  // desde el cual se extrae la cuenta para calcular los parámetros de navegación.
  const { stepCount, currentStep } = stepsContextValue;

  // comprobaciones que serán inyectadas como props en el componente de paso
  // y que le servirán para saber su posición en la lista y si tiene más elementos
  // antes o después.
  const isFirst: () => boolean = () => order === 0;
  const isLast: () => boolean = () => order === stepCount;
  const hasNext: () => boolean = () => order + 1 < stepCount;
  const hasPrev: () => boolean = () => order > 0;

  // si acabamos de cargar este paso, y hemos especificado una acción a realizar en
  // dicho momento, la ejecutamos.
  useEffect(() => {
    return () => {
      if (currentStep === order && onStepLoaded) onStepLoaded();
    };
  }, [currentStep, order, onStepLoaded]);

  // SÓLO se renderizan aquellos pasos cuyo orden coincida con el paso
  // actual del contexto general.
  if (order === currentStep) {
    const exclusiveProps: ExclusiveStepProps<T> = { ...props };

    const defaultTitle = "Step " + order;

    // Forzamos el tipo para calmar al type checker. De esta forma le aseguramos que
    // nunca vamos a tener un componente que tenga más parámetros que los básicos
    // más posiblemente un listado de campos exclusivos.
    const Component = component as unknown as ComponentType<StepComponentProps & ExclusiveStepProps<T>>;

    return (
      <Component
        {...exclusiveProps}
        {...stepsContextValue}
        title={title || defaultTitle}
        order={order}
        hasPrev={hasPrev}
        hasNext={hasNext}
        isFirst={isFirst}
        isLast={isLast}
      />
    );
  }
  return null;
}

//--------------------------------------------------------------
//             Definición del Gestor de Pasos
//--------------------------------------------------------------

/**
 * Una vez disponemos de las definiciones de un paso concreto, podemos 
 * pasar a definir el gestor general que mantendrá el estado global de 
 * los pasos y ejecutará la lógica de carga y descarga de cada uno de ellos.
 */

/**
 * En vez de un estado que sólo permita como valores los tipos clásicos de formularios
 * (strings, números y booleanos), vamos a utilizar el tipo unknown aquí como forma de 
 * tener estados más generales. El tipo `unknown` es la forma explícita de decirle a TS
 * que el valor correspondiente podría ser cualquier cosa (como `any`), pero a diferencia
 * de este último, `unkown` exige un casting explícito a un tipo conocido antes de poder 
 * usarse (lo cual tiende a ser mucho más seguro que llamar a métodos o propiedades de un
 * objeto sobre el que no tenemos nada garantizado, como suele ser el caso con `any`).
 */
/**
 * Definition of a (general) state to be handled by our context.
 * Values are always of type unknown to ensure that we can store anything within a dictionary entry.
 */
export type State = {
  [key: string]: unknown;
};

/**
 * A partir de aquí interesará definir un contexto general que sea accesible 
 * a cualquier componente de tipo Step, mediante el que estos puedan consultar
 * los distintos datos del formulario, o desencadenar acciones de consulta/ modificación
 * del estado/ navegación entre pasos. Observamos que una buena parte de las propiedades
 * de esta interfaz están presentes en los pasos individuales, y de hecho estos campos serán
 * utilizados para añadir información general a cada uno de los componentes `<Step>`.
 */

interface StepsContext {
  /** Number of steps available under this context */
  stepCount: number;
  /** Position of the currently active step (the one that will be rendered) */
  currentStep: number;
  /** List of all steps currently included within this context */
  stepList: StepEntry[];
  /** General state to be worked on throughout the different steps in the context */
  state: State;
  /** Function to set/update state by key */
  setState: <T>(key: string, setValue: React.SetStateAction<T>, initialValue: T) => void;
  /** Function to retrieve a state value by key */
  getState: <T>(key: string, deafultValue: T) => T;
  /** Callback describing how to move on to the next step in the sequence */
  next: () => void;
  /** Callback describing how to move back to the previous step in the sequence */
  prev: () => void;
  /** Callback describing how to jump to the given step in the sequence */
  jump: (step: number) => void;
}

/**
 * Con esto es posible crear un contexto (con un valor por defecto
 * para que el comprobador de tipos de TS no lance errores) que podrá
 * ser empleado desde cualquiera de los pasos para acceder a la información 
 * del estado de nuestro gestor. Como nota, lo que definimos aquí es el contexto
 * como entidad más o menos abstracta, luego podremos instanciar tantos proveedores
 * de este contexto como deseemos, cada uno con un estado propio particular.
 */
const StepsContext = createContext<StepsContext>({
  // Dummy values for satisfying the type checker
  // Gets updated before being passed down
  stepCount: 0,
  currentStep: 0,
  stepList: [],
  state: {},
  setState: (_, __) => { },
  getState: (_, __) => __,
  next: () => { },
  prev: () => { },
  jump: (_) => { },
});

/**
 * Al definir los props del gestor de pasos, podemos imponer un tipo determinado 
 * para los hijos de este componente mediante el uso de ReactElement<T>. Esencialmente,
 * esto nos permitirá lanzar errores en compilación si alguien trata de añadir un hijo 
 * a un componente `<Steps>` que no reciba como props, al menos, un tipo de datos que contenga
 * todos los campos de `StepProps` (se podrían usar tipos más extensos). La unión aquí es necesaria
 * porque React hace distinción entre un hijo suelto y un listado de hijos (un hijo suelto
 * NO es un listado con un elemento).
 * 
 * La configuración de los pasos permite especificar cómo queremos que se comporte el gestor,
 * incluyendo además la posibilidad de incorporar componentes exclusivos de navegación, before y
 * after (que van antes y después del cuerpo principal, respectivamente).
 */
export interface StepsProps {
  children: ReactElement<StepProps<StepComponentProps>> | ReactElement<StepProps<StepComponentProps>>[];
  config?: StepsConfig;
  genState: State;
  setGenState: React.Dispatch<React.SetStateAction<State>>;
};

/**
 * Esta configuración incluye básicamente tres elementos fundamentales:
 * + `before`: función que genera un componente de React a partir de unos props (componente funcional)
 * de manera que dicho componente quedará colocado antes de renderizar el contenido del paso activo.
 * 
 * + `after`: como before, pero se colocará después del contenido del paso activo.
 * 
 * + `navigation`: contiene tanto un componente general de navegación (generalmente para listar los
 * pasos y permitir saltar de uno a otro de forma explícita) como la ubicación relativa al contenido 
 * del paso donde deberá colocarse.
 */
export type StepsConfig = {
  before?: (props: any) => JSX.Element;
  after?: (props: any) => JSX.Element;
  navigation?: {
    component: (props: any) => JSX.Element;
    location?: "before" | "after";
  };
};


/**
 * Con todo lo anterior, estamos en disposición de pasar a hablar del propio componente
 * de gestión de pasos. Este toma como props la configuración descrita anteriormente y una 
 * serie de hijos con tipos restringidos a componentes con props que sabe entender.
 */
/**
 * Wrapper component for `Step` components.
 */
function Steps({ children, config, genState, setGenState }: StepsProps) {
  // referencia a cada uno de los hijos del componente en formato array
  // esto servirá para poblar la lista de elementos que podrá ser consumida
  // por los pasos individuales a partir del contexto general.
  const childSteps = React.Children.toArray(children);

  const NavigationComponent = (context: NavigationComponentProps) => {
    if (config?.navigation?.component) {
      const NavComponent = config?.navigation?.component;
      return <NavComponent {...context} />;
    }
  };

  const BeforeComponent = (context: NavigationComponentProps) => {
    if (config?.before) {
      const Before = config.before;
      return <Before {...context} />;
    }
  };

  const AfterComponent = (context: NavigationComponentProps) => {
    if (config?.after) {
      const After = config.after;
      return <After {...context} />;
    }
  };

  /**
   * Generar las entradas "cosméticas" de las que hablábamos antes para proporcionar
   * información adicional a los pasos a partir de los hijos del componente.
   */
  const stepList: StepEntry[] = childSteps.map((child, order) => {
    return {
      name:
        (child as { props: StepProps<StepComponentProps> }).props.title || "Step " + (order + 1),
      order: order,
    };
  });

  //----------------------------------------------
  //       Creación del Contexto Global
  //----------------------------------------------
  // número de pasos.
  const stepCount = childSteps.length;

  // paso actual (renderizándose en este momento)
  const _currentStep = useState<number>(0);
  const currentStep = _currentStep[0];
  const setCurrentStep = _currentStep[1];

  // gestionar el avance al siguiente paso
  const next: () => void = () => {
    if (currentStep + 1 < stepCount) {
      setCurrentStep(currentStep + 1);
    }
  };

  // gestionar el retroceso al paso previo
  const prev: () => void = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // gestionar un salto a un paso concreto
  const jump: (step: number) => void = (step) => {
    if (step >= 0 && step < stepCount) {
      setCurrentStep(step);
    }
  };

  // obtener un campo del estado por clave
  function getState<T>(key: string, defaultValue: T): T {
    if (key in genState) {
      return genState[key] as T;
    }
    return defaultValue;
  };

  // sobrescribir un campo del estado por clave
  function setState<T>(key: string, setValue: React.SetStateAction<T>, initialValue: T): void {
    if (typeof setValue === "function" && setValue.length === 1) {
      /**
       * Este tipo de asignación resulta fundamental para evitar conflictos a la hora de modificar el estado.
       * Cuando se hacen múltiples setState sobre una propiedad mantenida por medio de un useState (y en nuestro
       * caso esto va a estar ocurriendo a menudo, puesto que modificar dos o más propiedades en un mismo render
       * va a llevar a que se modifique el mismo estado general varias veces), SÓLO se mantiene el último cambio,
       * lo cual quiere decir que si modificamos los campos A y B, sólo se mantendrá el valor al asignar el campo B,
       * quedando la asignación a A ignorada. Para evitar esto, se puede utilizar el patrón de actualización sobre
       * el valor previo (prev => ...) que SÍ que se combina con sucesivas asignaciones (se encadena).
       */
      setGenState(prevState => {
        // setValue es un método ((prevState: S) => S)
        const newState = Object.assign({}, prevState);
        if (newState[key]) {
          newState[key] = (setValue as (((prevState: T) => T)))(newState[key] as T);
        }
        else {
          newState[key] = (setValue as (((prevState: T) => T)))(initialValue);
        }
        return newState;
      });
    }
    else {
      const pureValue = setValue as T;
      setGenState(prevState => {
        // setValue es un valor sin más => asignación directa
        const newState = Object.assign({}, prevState);
        newState[key] = pureValue;
        return newState;
      });
    }
  };

  const context = {
    stepCount,
    currentStep,
    stepList,
    state: genState,
    setState,
    getState,
    next,
    prev,
    jump,
  };

  const jumpWithString = (s: string): void => {
    let destiny = 0;
    if(s === "AdventureSummary") {destiny = 0;}
    if (s === "AdventureCharger") { destiny = 1; }
    else if (s === "QR") { destiny = 2; }
    else if (s === "Quiz") { destiny = 3; }
    else if (s == "ImageCharger") { destiny = 4; }
    else if (s == "ImageTargetStage") { destiny = 5; }
    else if (s === "Default") { return; }

    //Si saltamos a una fase a partir de esto significa que ya no estamos sobreescribiendo nada
    setState<boolean>('SobreEscribir',false,false);
    jump(destiny);
  };

  //Este método tiene como objetivo gestionar la escena a la que se quiere ir por medio del selector
  //Lo que hace es mirar que se acaba de seleccionar y dependiendo de lo escogido nos vamos a una escena 
  //u otra
  const UpdateSelector = (evt: React.FormEvent<HTMLSelectElement>): void => {
    evt.preventDefault();
    let s: string = evt.currentTarget.value;
    jumpWithString(s);
  };

  //Metodo para ir a un paso concreto a través de un boton
  const BtnToStep = (evt: React.FormEvent<HTMLButtonElement>): void => {
    evt.preventDefault();
    let s: string = evt.currentTarget.value;
    (document.getElementById('Selector') as HTMLSelectElement).value = "Crear fase...";
    jumpWithString(s);
  };


  //MEtodo que aumenta en 1 la siguiente posicion en la que vamos a añadir una nueva fase a la aventur
  //En caso de que no este en el rango adecuado lo clampeamos 
  const AumentarPosSiguienteFase = (): void => {
    let value = getState<number>('WhereToPush', 0) + 1;
    let current_state = getState<any>('DATA', []);
    if (value > current_state.length) value = current_state.length;
    setState<number>('WhereToPush', value, 0);
    console.log(value);
  }

  //MEtodo que disminuye en 1 la siguiente posicion en la que vamos a añadir una nueva fase a la aventur
  //En caso de que no este en el rango adecuado lo dejamos como minimo en 1 
  const DisminuirPosSiguienteFase = (): void => {
    let value = getState<number>('WhereToPush', 0) - 1;
    if (value < 0) value = 0;
    setState<number>('WhereToPush', value, 0);
  }


  const guardarFase = async () => {
    let new_state = getState<any>('DATA', []);
    let sobreEscribir = getState<boolean>('SobreEscribir', false);
    //Preparo los datos que voy a añadir
    let newData = getState<any>('faseConfigurandose', {});
    if(newData.Alert){
      alert(newData.MensageAlert);
      return;
    }

    //Los añado a una copia del estado y establezco esta copia como el estadoa actual de las fases            
    if(sobreEscribir === true){
      //De esta forma se puede meter el estado en unaposicion concreta en lugar de hacerlo en el final siempre
      let position = getState<number>('FaseConfigurable',1);
      new_state.splice(position,1,newData.datosFase);
    }
    //Si no hay que sobreescribir nada simplemente pusheamos al final de los datos
    else {
      //Lo almaceno en la lista de fases que tengo disponibles
      let position = getState<number>('WhereToPush',1);
      new_state.splice(position, 0, newData.datosFase);
    }
    console.log("Los datos ahora son: "+JSON.stringify(new_state));

    //Establezco que los datos de la aventura son aquellos que ya había y el nuevo que acabo de añadir
    setState('DATA',new_state,[]);
    setState<boolean>('SobreEscribir',false,false);

    //Importante aumentar el indice de donde estamos metiendo nuevos elementos a la aventura para que no 
    //se metan todos en la posicion X y que luego estén TODOS EN ORDEN INVERSO
    setState<number>('WhereToPush',getState<number>('WhereToPush',1)+1,1);

    (document.getElementById('Selector') as HTMLSelectElement).value = "Crear fase...";
    jumpWithString("AdventureSummary");
  } 

  return (
    <div>
      <head>
      {/*<!-- Required meta tags -->*/}
        <meta charSet="utf-8"></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>

      {/* <!-- Bootstrap CSS --> */}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" /*rel="stylesheet"*/ integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossOrigin="anonymous"></link>
      </head>
      <body className="bodyBackGround">
        {/* Grid configurado para que tenga un hoizontal layout que contiene tanto el selector de fase a configurar como el elemento para cargar una aventura desde fichero */}
        <div className='orangeBackGround grid'>
          {/* Este es el selector con el que nos podemos mover entre escenas */}
          <div className="center">
            <p className="Titulo" style={{fontSize:'150%',marginTop:'1%', marginBottom:'1%'}}>Fases disponibles:</p>
            <select className="mySelect" id="Selector" style={{marginTop:'1%', marginBottom:'1%', marginLeft:'1%'}} onChange={UpdateSelector} onSelect={UpdateSelector}>
              <option value="Crear fase..." hidden selected>Crear fase...</option>
              <option value="QR">QR</option>
              <option value="Quiz">Quiz</option>
              <option value="ImageCharger">Image Charger</option>
              <option value="ImageTarget">Vuforia Image Target</option>
            </select>
            <button type="button" onClick={guardarFase} className="my-btn btn-outline-pink" style={{fontSize:'150%',marginTop:'1%', marginBottom:'1%', marginLeft:'2%'}}>Guardar fase</button>
          </div>
          <div className="center">
            <button value="AdventureCharger" onClick={BtnToStep} type="button" className="my-btn btn-outline-brown" style={{fontSize:'150%',marginTop:'1%', marginBottom:'1%'}}>Cargar aventura</button>
            <button value="AdventureSummary" onClick={BtnToStep} type="button" className="my-btn btn-outline-green" style={{fontSize:'150%',marginTop:'1%', marginBottom:'1%', marginLeft:'10%'}}>Estado de aventura</button>
          </div>
        </div>

        {/* Grid configurado para que tenga un hoizontal layout que contiene tanto el selector de dónde queremos que se pushee la siguiente fase como el selector de fases existente
      con el que podemos configurar una de las fases que ya tengamos */}
        {/* Esta es la seccion que permite configurar la posicion de la siguiente fase que vayamos a incluir */}
        <div >
          <h4>Posicion a insertar la siguiente fase de la aventura</h4>
          <div >
            <button  data-testid='<' onClick={DisminuirPosSiguienteFase}> - </button>
            <p >{getState('WhereToPush', 0) + 1}º </p>
            <button  data-testid='>' onClick={AumentarPosSiguienteFase}> + </button>
            <p >de los {getState<any>('DATA', []).length} actuales</p>
          </div>
        </div>

        {/* Estos son los hijos que representan las diferentes "escenas" por las que podemos pasar y configurar la  aventura */}
        <StepsContext.Provider value={context}>
          {config?.before && BeforeComponent(context)}
          {config?.navigation?.location === "before" &&
            NavigationComponent(context)}
          {React.Children.map(children, (child, order) => (
            <StepContext.Provider value={{ order: order }}>
              {child}
            </StepContext.Provider>
          ))}
          {config?.navigation?.location === "after" && NavigationComponent(context)}
          {config?.after && AfterComponent(context)}
        </StepsContext.Provider>
        
        {/* Este boton tiene como objetivo descargar el proyecto generado */}
        {/* <a href="ProyectoUnity.zip"  download={getState('adventureName',"Nombre por defecto")}>
          <button  type="button" >
          Descargar Aventura
        </button>      
      </a> */}

        {/* <!-- Option 1: Bootstrap Bundle with Popper --> */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossOrigin="anonymous"></script>

      </body>

     

    </div>
  );
}

export { Steps, Step };