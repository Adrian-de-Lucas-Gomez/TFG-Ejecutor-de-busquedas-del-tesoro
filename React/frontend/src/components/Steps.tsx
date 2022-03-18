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
import React, { useContext, useEffect, useState } from "react";
import { ComponentType, createContext, ReactElement } from "react";
import { json } from "stream/consumers";
import './Styles/Steps.css'
import axios from "axios"


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


  const downloadFile = (data: string, fileName: string, fileType: string) => {
    // Create a blob with the data we want to download as a file
    const blob = new Blob([data], { type: fileType })
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
    const a = document.createElement('a')
    a.download = fileName
    a.href = window.URL.createObjectURL(blob)
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    a.dispatchEvent(clickEvt)
    a.remove()
  }


  //Para exportar los datos a un JSON lo que hago es preparar un array, y en este array voy a meter las cosas que me vayan dando los eventos
  const exportToJson = (e: any) => {
    e.preventDefault();
    // //Una vez que tengo los datos de cada evento, preparo un JSON y lo descargo
    var datos = [];
    let f = getState<any>('DATA', []);
    console.log(genState);
    let contadorImagenes = 0;

    for (let i = 0; i < f.length; i++) {
      var faseActual = f[i];
      //En caso de que sea una fase de tipo imagen
      if (faseActual.tipo === "ImageStage" && faseActual.Imagen instanceof File) {
        //El nombre de la imagen va a ser el orden de esta en la aventura mas su misma extension
        var finalImageName = faseActual.Imagen.name;
        finalImageName = (contadorImagenes.toString()) + (finalImageName.substring(finalImageName.indexOf('.')));
        //Cambiamos la fase para que el json tenga la referencia a esta
        faseActual = { tipo: "ImageStage", Imagen: finalImageName };
        contadorImagenes++;
      }
      datos.push(faseActual);
    }
    var jsonFinal = { Gencana: getState('adventureName', "Nombre por defecto"), fases: datos }
    downloadFile(JSON.stringify(jsonFinal, null, 2), 'answers.json', 'text/json')
  }

  const mandarJson = () => {

    console.log("Voy a intentar mandar el json");
    // //Una vez que tengo los datos de cada evento, preparo un JSON y lo descargo
    var datos = [];
    let f = getState<any>('DATA', []);
    console.log(genState);
    let contadorImagenes = 0;

    for (let i = 0; i < f.length; i++) {
      var faseActual = f[i];
      //En caso de que sea una fase de tipo imagen
      if (faseActual.tipo === "ImageStage" && faseActual.Imagen instanceof File) {
        //El nombre de la imagen va a ser el orden de esta en la aventura mas su misma extension
        var finalImageName = faseActual.Imagen.name;
        finalImageName = (contadorImagenes.toString()) + (finalImageName.substring(finalImageName.indexOf('.')));
        //Cambiamos la fase para que el json tenga la referencia a esta
        faseActual = { tipo: "ImageStage", Imagen: finalImageName };
        contadorImagenes++;
      }
      else if (faseActual.tipo === "ImageTarget" && faseActual.Package instanceof File) {

        //Cambiamos la fase para que el json tenga la referencia a esta
        faseActual = { tipo: "ImageTarget", Key: faseActual.Key, Package: faseActual.Package.name, Target: faseActual.Target };
      }
      datos.push(faseActual);
    }
    var jsonFinal = { Gencana: getState('adventureName', "Nombre por defecto"), fases: datos }

    //Guardamos el contenido de la aventura (en formato string) en un json que es el que al final se manda
    axios.post("./wtf-json", { json: JSON.stringify(jsonFinal, null, 2) });
  }

  const generateZip = () => {

    mandarJson();
    operacionesPreDescargaProyecto();
    // //Una vez que tengo los datos de cada evento, preparo un JSON y lo descargo
    var name = getState('adventureName', "Nombre por defecto");

    // axios.get("./generate-zip",  { params: { zipName: name } });
    axios.get("./generate-zip", {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      const type = response.headers['content-type']
      const blob = new Blob([response.data], { type: type })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = name + '.zip';
      link.click();
      link.remove();
    })
  }


  //Este método tiene como objetivo gestionar la escena a la que se quiere ir por medio del selector
  //Lo que hace es mirar que se acaba de seleccionar y dependiendo de lo escogido nos vamos a una escena 
  //u otra
  const UpdateSelector = (evt: React.FormEvent<HTMLSelectElement>): void => {
    evt.preventDefault()
    let s: string = evt.currentTarget.value;
    let destiny = 0;
    if (s === "QR") { destiny = 0; }
    else if (s === "Quiz") { destiny = 1; }
    else if (s === "ImageCharger") { destiny = 2; }
    else if (s === "ImageTarget") { destiny = 3; }
    else if (s === "Default") { return; }
    jump(destiny);
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
    console.log(value);
  }


  //MEtodo que aumenta en 1 la siguiente posicion en la que vamos a añadir una nueva fase a la aventur
  //En caso de que no este en el rango adecuado lo clampeamos 
  const AumentarPosSiguienteFaseConfigurable = (): void => {
    let value = getState<number>('FaseConfigurable', 0) + 1;
    let current_state = getState<any>('DATA', []);
    if (current_state.length === 0) value = 0;
    else if (value >= current_state.length) value = current_state.length - 1;
    setState<number>('FaseConfigurable', value, 0);
    console.log(value);
  }

  //MEtodo que disminuye en 1 la siguiente posicion en la que vamos a añadir una nueva fase a la aventur
  //En caso de que no este en el rango adecuado lo dejamos como minimo en 1 
  const DisminuirPosSiguienteFaseConfigurable = (): void => {
    let value = getState<number>('FaseConfigurable', 0) - 1;
    if (value < 0) value = 0;
    setState<number>('FaseConfigurable', value, 0);
    console.log(value);
  }

  //este método tiene como objetivo mirar qué fase es la que estamos seleccionando dentro de las que ya tenemos creadas
  // e ir a la escena que representa esa fase para poder reconfigurarla 
  const ConfigurarFase = (): void => {
    //Pregunto por cual es la fase que estamos seleccionando y me quedo con las fases disponibles
    let value = getState<number>('FaseConfigurable', 1);
    let new_state = getState<any>('DATA', [{}]);
    if (new_state.length < 2) {
      alert("No ha ninguna fase que configurar");
      return;
    }

    //Indico que vamos a empezar a sobreescribir 
    setState<boolean>('SobreEscribir', true, true);

    //miro a qué escena me tengo que ir para reconfigurar la fase que estoy intentando seleccionar
    let escena = 0;
    if (new_state[value].tipo === "QRStage") escena = 0;
    else if (new_state[value].tipo === "QuizStage") escena = 1;
    else if (new_state[value].tipo === "ImageStage") escena = 2;
    else if (new_state[value].tipo === "ImageTarget") escena = 3;

    jump(escena);
  }

  //MEtodo que aumenta en 1 la siguiente posicion en la que vamos a añadir una nueva fase a la aventur
  //En caso de que no este en el rango adecuado lo clampeamos 
  const AumentarPosSiguienteFaseABorrar = (): void => {
    let value = getState<number>('FaseABorrar', 0) + 1;
    let current_state = getState<any>('DATA', []);
    if (current_state.length === 0) value = 0;
    else if (value >= current_state.length) value = current_state.length - 1;
    setState<number>('FaseABorrar', value, 0);
    console.log(value);
  }

  //MEtodo que disminuye en 1 la siguiente posicion en la que vamos a añadir una nueva fase a la aventur
  //En caso de que no este en el rango adecuado lo dejamos como minimo en 1 
  const DisminuirPosSiguienteFaseABorrar = (): void => {
    let value = getState<number>('FaseABorrar', 0) - 1;
    if (value < 0) value = 0;
    setState<number>('FaseABorrar', value, 0);
    console.log(value);
  }

  //este método tiene como objetivo mirar qué fase es la que estamos seleccionando dentro de las que ya tenemos creadas
  // e ir a la escena que representa esa fase para poder reconfigurarla 
  const BorrarFase = (): void => {
    //Pregunto por cual es la fase que estamos seleccionando y me quedo con las fases disponibles
    let value = getState<number>('FaseABorrar', 1);
    let new_state = getState<any>('DATA', []);
    if (new_state.length < 1) {
      alert("No ha ninguna fase que borrar");
      return;
    }
    new_state.splice(value, 1);
    setState('DATA', new_state, []);
    ComprobarIndicesFases();
  }

  //este metodo tiene como objetivo comprobar que los indices de pusheo, reconfiguracion y borrado no se encuentran fuera de los límites del array de estados
  //para evitar que se trabajen con posiciones que no existen de este
  const ComprobarIndicesFases = () => {
    //Me hago tanto con el estado como con los indices 
    let estado = getState<any>('DATA', []);
    let indiceBorrar = getState<number>('FaseABorrar', 1);
    let indiceReconfigurar = getState<number>('FaseConfigurable', 1);
    let indicePushear = getState<number>('WhereToPush', 0) - 1;
    //Me encargo de que nadie este apuntando a una posicion invalida
    let tamaño = estado.length;
    if (indiceBorrar >= tamaño) indiceBorrar = tamaño - 1;
    if (indiceReconfigurar >= tamaño) indiceReconfigurar = tamaño - 1;
    if (indicePushear >= tamaño) indicePushear = tamaño - 1;
    //Guardo los posibles cambios que hayan pasado
    setState<number>('FaseABorrar', indiceBorrar, 0);
    setState<number>('FaseConfigurable', indiceReconfigurar, 0);
    setState<number>('WhereToPush', indicePushear, 0);
  }



  //Este método tiene como objetivo recibir un fichero json en el que se encuentra almacenada una aventura, en caso de que no haya ninguna aventura se
  //alertará dicendo que han habido problemas
  const loadAdventureFromFile = (e: any): void => {
    //Si de casualidad ha habido un error y es null lo que he obtenido no se hace nada
    if (e === null) {
      alert("Problemas con el fichero");
      return;
    }
    //Preparo el filereader que va a leer el JSON
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");

    //Se lee el fichero que se acaba de subir
    fileReader.onload = e => {

      {/* @ts-ignore */ }
      let obj = JSON.parse(e.target.result as string);

      //Tras parsear el json miro las fases que contiene este fichero y las añado a mi aventura
      let nuevasFases = [];
      for (let i = 0; i < obj.fases.length; i++) {
        nuevasFases.push(obj.fases[i]);
      }
      //Asigno lo leido al estado actual 
      setState('DATA', nuevasFases, []);
    };
  };

  //Metodo que toma el texto que se esté escribiendo en el form para indicar el nombre que queremos que tenga la aventura y lo
  //guarda para que la futura aventura que vayamos a descargar tenga dicho nombre
  const modifyAdventureName = (e: string): void => {
    setState('adventureName', e, "Nombre por defecto");
  }

  /*
    Metodo auxiliar para mandar distintos tipos de archivo al servidor. Tiene como parametros
  */
  const sendFileToServer = (identifier: string, file: File, fileName: string, route: string): void => {
    //Mandamos el archivo file al backend para que la trate de cara al proyecto
    //Creamos un FORMDATA que sera el que finalmente enviemos en la peticion POST
    const formData = new FormData();
    formData.append(identifier, file, fileName);
    //Hacemos una peticion POST a nuestro servidor a la route especificada
    axios.post(route, formData);
  }


  //Este método tiene como objetivo preparar cosas especificas de alguna fase, como por ejemplo mandar las imagenes 
  //al backend para que las trate en el proyecto y poder preparar el json de la aventura datos que nos ayuden recurrir a dichas
  //imagenes
  const operacionesPreDescargaProyecto = (): void => {
    console.log("Atencion operaciones antes de descargar el proyecto");
    //Tenemos que recorrer las posibles imagenes de la aventura y enviarlas al server para que haga algo con ellas
    var fasesAventura = getState<any>('DATA', []);;
    var contadorImagenes = 0
    for (var i = 0; i < fasesAventura.length; i++) {
      
      var faseActual = fasesAventura[i];
      if (faseActual.tipo === "ImageStage" && faseActual.Imagen instanceof File) {
        var finalImageName=faseActual.Imagen.name;
        finalImageName = (contadorImagenes.toString())+( finalImageName.substring(finalImageName.indexOf('.')));
        console.log("El nombre de la imagen es "+ finalImageName);
        sendFileToServer('imageCharger', faseActual.Imagen, finalImageName, "./image-upload")
        contadorImagenes++
      }
      else if (faseActual.tipo === "ImageTarget" && faseActual.Package instanceof File) {
        sendFileToServer('unityPackage', faseActual.Package, faseActual.Package.name, "./package-upload")
      }
    }
    setState('DATA', fasesAventura, []);
  }



  return (
    <div className='Coso'>

      {/* Seccion que representa la parte superior del formulario que permite especificar qué nombre queremos que tenga la aventura 
    si no ponemos nada el nombre será el original del archivo que vayamos a descargar*/}
      <h3 className='Titulo' >Nombre de la aventura</h3>
      <form onSubmit={e => e.preventDefault()}>
        <input className='QRForm' type="text" onChange={e => modifyAdventureName(e.target.value)}></input>
      </form>


      {/* Grid configurado para que tenga un hoizontal layout que contiene tanto el selector de fase a configurar como el elemento para cargar una aventura desde fichero */}
      <div className='grid'>
        {/* Este es el selector con el que nos podemos mover entre escenas */}
        <div className="greenBackGround">
          <h4>Selector de fases</h4>
          <select id="Selector" className="form-select" onChange={UpdateSelector} onSelect={UpdateSelector} >
            <option value="Default">Default</option>
            <option value="QR">QR</option>
            <option value="Quiz">Quiz</option>
            <option value="ImageCharger">Image Charger</option>
            <option value="ImageTarget">Vuforia Image Target</option>
          </select>
        </div>

        {/* Parte que representa el cargador de aventuras a partir de un fichero */}
        <div className="redBackGround">
          <h4>Cargar aventura de archivo</h4>
          <input type='file' id='file' className='input-file' accept='.json' onChange={loadAdventureFromFile} ></input>
        </div>
      </div>

      {/* Grid configurado para que tenga un hoizontal layout que contiene tanto el selector de dónde queremos que se pushee la siguiente fase como el selector de fases existente
    con el que podemos configurar una de las fases que ya tengamos */}
      <div className='grid-container'>

        {/* Esta es la seccion que permite configurar la posicion de la siguiente fase que vayamos a incluir */}
        <div className="redBackGround">
          <h4>Posicion a insertar la siguiente fase de la aventura</h4>
          <div className='rows'>
            <button className='row' data-testid='<' onClick={DisminuirPosSiguienteFase}> - </button>
            <p className='row'>{getState('WhereToPush', 0) + 1}º </p>
            <button className='row' data-testid='>' onClick={AumentarPosSiguienteFase}> + </button>
            <p className='row'>de los {getState<any>('DATA', []).length} actuales</p>
          </div>
        </div>

        {/* Esta es la seccion que permite reconfigurar alguna fase ya existente */}
        <div className="greenBackGround">
          <h4>Fase que se quiere reconfigurar</h4>
          <div className='rows'>
            <button className='row' data-testid='<' onClick={DisminuirPosSiguienteFaseConfigurable}> - </button>
            <p className='row'>{getState('FaseConfigurable', 0) + 1}º </p>
            <button className='row' data-testid='>' onClick={AumentarPosSiguienteFaseConfigurable}> + </button>
            <p className='row'>de los {getState<any>('DATA', []).length} actuales</p>
            <button className='row' data-testid='>' onClick={ConfigurarFase}> Configurar Fase </button>
          </div>
        </div>

        {/* Esta es la seccion que permite reconfigurar alguna fase ya existente */}
        <div className="redBackGround">
          <h4>Fase que se quiere borrar</h4>
          <div className='rows'>
            <button className='row' data-testid='<' onClick={DisminuirPosSiguienteFaseABorrar}> - </button>
            <p className='row'>{getState('FaseABorrar', 0) + 1}º </p>
            <button className='row' data-testid='>' onClick={AumentarPosSiguienteFaseABorrar}> + </button>
            <p className='row'>de los {getState<any>('DATA', []).length} actuales</p>
            <button className='row' data-testid='>' onClick={BorrarFase}> Borrar Fase </button>
          </div>
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

      {/* Este es el boton con el que se puede pedir que se descargue el JSON que engloba la aventura */}
      <form onSubmit={exportToJson}>
        <button type="submit">Creame un JSON hijo mio</button>
      </form>

      {/* Este boton tiene como objetivo descargar el proyecto generado */}
      <div>
        <button type="button" onClick={generateZip}>
          Generar Aventura
        </button>
      </div>

      {/* Este boton tiene como objetivo descargar el proyecto generado */}
      {/* <a href="ProyectoUnity.zip"  download={getState('adventureName',"Nombre por defecto")}>
        <button  type="button" >
        Descargar Aventura
      </button>      
    </a> */}

    </div>
  );
}

export { Steps, Step };