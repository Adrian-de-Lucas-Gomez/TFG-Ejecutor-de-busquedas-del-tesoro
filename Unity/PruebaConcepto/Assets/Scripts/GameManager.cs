using Newtonsoft.Json.Linq;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;
using Vuforia;

public class GameManager : MonoBehaviour
{

    public Adventure adventure;
    public GameObject sceneMainCamera;

    [Tooltip("Lista de informacion de las fases por las que vamos a pasar")]
    public static Queue<AdventureInfo> adventureStages = new Queue<AdventureInfo>();


    KeyValuePair<string, AsyncOperation> _preloadedScene;

    private Stage _currentStage = null;


    //Lista en la que se van a almacenar los tipos de fases que están involucradas en la aventura que vamos a jugar
    List<string> scenesInvolved;

    //Lista negra de las escenas que consideramos grandes y es necesario cargar y descargar a medida que can ocurriendo porque si no 
    //los recursos pueden llegar a ser gastados poe estas
    List<string> bigScenes = new List<string>() { "QRStage" };


    static GameManager _instance;


    public static GameManager getInstance()
    {
        return _instance;
    }

    void Awake()
    {
        //en caso de que la instancia no exista nos ponemos nosotros como instancia
        if (_instance == null)
        {
            _instance = this;
            /*
             * Necesitamos cargar la aventura antes de que se cree cualquier escena puesto
             * que la key de vuforia debe asignarse antes de que se cree cualquier escena que 
             * use vuforia
             */
            loadAdventure();
            DontDestroyOnLoad(this);
        }
        //Si hay algo ya en esta posicion yo me destruyo
        else
            Destroy(this);
    }

    private void Start()
    {
        _preloadedScene = new KeyValuePair<string, AsyncOperation>("", null);

        loadAllSmallScenes();
    }

    /// <summary>
    /// Método que toma el JSON que contiene la aventura, lo lee, y genera los bloques de datos que van a ser necesarios para que las diferentes fases
    /// de esta aventura puedan solicitarlos y obtener funcionalidad
    /// </summary>
    private void loadAdventure()
    {
        //Me hago con el JSON, saco toda la info que tenga dentro y genero un diccionario a partir de esta 
        string json = adventure.adventureFile.ToString();
        var adventureData = JObject.Parse(json);


        //Voy a recorrer todas las fases que existan en este json
        JArray misFases = (JArray)adventureData["fases"];

        //Preparamos las fases iniciales y finales
        AdventureInfo start = new AdventureInfo(); start.stage = "Start";
        AdventureInfo end = new AdventureInfo(); end.stage = "End";

        adventureStages.Enqueue(start);
        for (int i = 0; i < misFases.Count; i++)
        {
            //Por cada fase voy a preguntar por su tipo y voy a crearme un objeto que contenga su informacion
            switch (misFases[i]["tipo"].Value<string>())
            {
                //En caso de que tengamos que leer un quiz
                case "QuizStage":
                    {
                        QuizInfo newQuiz = new QuizInfo();
                        newQuiz.readFromJSON((JObject)misFases[i]);
                        adventureStages.Enqueue(newQuiz);
                        break;
                    }
                case "QRStage":
                    {
                        QRInfo newQR = new QRInfo();
                        newQR.readFromJSON((JObject)misFases[i]);
                        adventureStages.Enqueue(newQR);
                        break;
                    }
                case "ImageStage":
                    {
                        ImageInfo newImage = new ImageInfo();
                        newImage.readFromJSON((JObject)misFases[i]);
                        adventureStages.Enqueue(newImage);

                        break;
                    }
                case "ImageTargetStage":
                    {
                        ImageTargetInfo newTarget = new ImageTargetInfo();
                        newTarget.readFromJSON((JObject)misFases[i]);
                        //TO DO: reconfigurar la generación del JSON de react y sacar la key fuera de las fases
                        VuforiaConfiguration.Instance.Vuforia.LicenseKey = newTarget.keyPackage;
                        adventureStages.Enqueue(newTarget);
                        break;
                    }
            }
        }
        adventureStages.Enqueue(end);
    }

    private void loadAllSmallScenes()
    {
        //Preparo una lista con todos los nombres de todas las escenas involucradas en esta aventura
        scenesInvolved = getScenesInvolvedInAdventure();

        for (int i = 0; i < scenesInvolved.Count; i++)
        {
            string name = scenesInvolved[i];
            //en caso de que sea vacio o de que sea una de las escenas grandes no nos preocupamos de cargarla ahora porque lo haremos durante la aventura
            if (name == "" || bigScenes.Contains(name)) continue;

            AsyncOperation asyncOp = SceneManager.LoadSceneAsync(name, LoadSceneMode.Additive);
            asyncOp.allowSceneActivation = true;
            _preloadedScene = new KeyValuePair<string, AsyncOperation>(name, asyncOp);
        }
    }

    /// <summary>
    /// Método que tiene como objetivo analizar las fases que vamos a tener en la aventura y devolver una lista con los nombres de todas las fases que esta contiene
    /// pero sin repeticiones, dicha lista se utilizará para cargar las escenas necesarias con los nombres devueltos
    /// </summary>
    /// <returns></returns>
    private List<string> getScenesInvolvedInAdventure()
    {
        //Preparo tanto la lista que voy a devolver como la pila de escenas por las que vamos a pasar en un formato más cómodo para recorrer
        List<string> scenesInvolved = new List<string>();
        AdventureInfo[] info = adventureStages.ToArray();

        //recorro todos los elementos del array y si no existen todavia en la lista de escenas involucradas las añado
        for (int i = 0; i < info.Length; i++)
            if (!scenesInvolved.Contains(info[i].stage)) scenesInvolved.Add(info[i].stage);

        return scenesInvolved;
    }


    /// <summary>
    /// Método que sirve para indicarle al gamemanager el estado actual que se está ejecutando en la aventura, esto
    /// sirve para que le gamemanager le pase a dicho estado el bloque de datos que necesita para poder
    /// ejecutar la siguiente fase
    /// </summary>
    /// <param name="st"></param>
    public void SetCurrentStage(Stage st)
    {
        _currentStage = st;
        InitCurrentStage();
    }

    /// <summary>
    /// Este método tiene como objetivo devolver la fase que se encuentra ahora en primer lugar en la cola de estas
    /// </summary>
    /// <returns></returns>
    public string getCurrentStageType()
    {
        return adventureStages.Peek().stage;
    }

    /// <summary>
    /// Inicia _currentStage con la siguiente aventura en la lista, y la quita de esta
    /// </summary>
    private void InitCurrentStage()
    {
        _currentStage.Init(adventureStages.Peek());
    }

   

    /// <summary>
    /// este método tiene como objetivo ser llamado por las múltiples fases por las que vamos a pasar para que estas
    /// Al terminar lo llamen para eliminar esa fase de la cola y poder pasar a la siguiente
    /// </summary>
    public void GoToNextPhase()
    {
        string completedScene = adventureStages.Peek().stage;

        //Eliminamos la fase que nos acabamos de pasar
        adventureStages.Dequeue();

        //Si cambiamos de escena nos preparamos para un posible cambio con respecto a AR o con escenas grandes
        if (completedScene != adventureStages.Peek().stage)
        {
            checkToUnloadCompletedScene(completedScene);
            //Nos ocupamos de la cámara para que no de problemas en caso de que cambiemos de modo normal a AR y viceversa
            checkForARScene();
        }
        else    //Si es la misma escena hay que recargar los recursos con el Init
        {
            Debug.Log("Misma fase, hay que recargarla");
            InitCurrentStage();
        }

        //Hay que hacerse cargo de empezar a cargar la siguiente escena en caso de que esta sea grande 
        checkLoadSceneOperations();
    }

    //Este método tiene como objetivo hacerse cargo de la cámara principal de las escena de lógica en caso de que nos vayamos a adentrar en una escena de AR
    //Porque si nos metemos en una escena de AR, los componentes de vuforia relacionados con la cámara de AR se van a atachear automáticamente, y si eso ocurre tendríamos
    //2 cámaras AR a la vez en ejecución, lo cual hace que la ejecución salte por los aires, para evitar esto es necesario desactivar la cámara para que no obtenga dichos  componentes
    private void checkForARScene()
    {
        //Si la escena que toca es de esas que tienen una cámara AR significa que no tenemos que tener activa la cámara principal de la aventura
        bool mainCameraMustBeActive;
        if (adventureStages.Peek().stage == "QRStage") mainCameraMustBeActive = false;
        else mainCameraMustBeActive = true;

        sceneMainCamera.SetActive(mainCameraMustBeActive);
    }


    /// <summary>
    /// este método tiene como objetivo mirar si es necesario cargar la parte restante de una escena o de mirar si la escena que viene despues de la actual es grande
    /// y por lo tanto hay que empezar a precargarla desde ya mismo
    /// </summary>
    private void checkLoadSceneOperations()
    {
        //Nos hacemos cargo en caso de que haga falta el posible 10% de carga de la siguiente escena en caso de que esta hubiera estado en espera
        if (_preloadedScene.Value != null)
        {
            ActivatePreloadedScene();
            _preloadedScene = new KeyValuePair<string, AsyncOperation>("", null);
        }
        //Miramos si la siguiente escena a esta necesita de precarga
        if (adventureStages.ToArray().Length > 1 && adventureStages.ToArray()[1].stage == "QRStage")
        {
            PreloadNextScene();
        }
    }


    /// <summary>
    /// Este método tiene como objetivo recibir el nombre de la escena que se acaba de completar y hacerse cargo de su descarga en caso de que sea necesario 
    /// </summary>
    /// <param name="completedScene"></param>
    private void checkToUnloadCompletedScene(string completedScene)
    {
        bool mustUnload = false;
        //En caso de que sea una de las escenas grandes tenemos que descargarla
        if (bigScenes.Contains(completedScene)) mustUnload = true;

        //Si no es una escena grande, miramos si dicha escena va a aparecer más veces más adelante en la aventura, y si NO LO HACE la descargamos
        else
        {
            AdventureInfo[] a = adventureStages.ToArray();
            int i = 0;
            while (i < a.Length && a[i].stage != completedScene) i++;
            mustUnload = i >= a.Length;
        }

        //Si es necesario descargarla me aseguro de que este cargada y entonces la descargo
        if (mustUnload && SceneManager.GetSceneByName(completedScene).isLoaded) SceneManager.UnloadSceneAsync(completedScene);
    }

    /// <summary>
    /// Carga la siguiente escena al 90% y la guarda en _preloadedScene
    /// </summary>
    private void PreloadNextScene()
    {
        //En caso de que se haya terminado nos vamos a la escena de fin, pero si hay más de una escena por hacer, pongo a precargar la que se viene despues
        string name = (adventureStages.Count <= 1) ? "End" : adventureStages.ToArray()[1].stage;
        if (name == "End") return;

        AsyncOperation asyncOp = SceneManager.LoadSceneAsync(name, LoadSceneMode.Additive);
        asyncOp.allowSceneActivation = false;
        _preloadedScene = new KeyValuePair<string, AsyncOperation>(name, asyncOp);
    }


    /// <summary>
    /// Activa la escena precargada, deja que se complete la carga al 100%
    /// </summary>
    private void ActivatePreloadedScene()
    {
        _preloadedScene.Value.allowSceneActivation = true;
    }

}