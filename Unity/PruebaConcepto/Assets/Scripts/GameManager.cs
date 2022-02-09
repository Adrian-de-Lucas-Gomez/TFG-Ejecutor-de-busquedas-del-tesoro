using Newtonsoft.Json.Linq;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{

    public Adventure adventure;

    [Tooltip("Lista de informacion de las fases por las que vamos a pasar")]
    public static Queue<AdventureInfo> adventureStages = new Queue<AdventureInfo>();

    KeyValuePair<string, AsyncOperation> _preloadedScene;

    private Scene _currentScene;

    private Stage _currentStage = null;

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
            DontDestroyOnLoad(this);
        }
        //Si hay algo ya en esta posicion yo me destruyo
        else
            Destroy(this);
    }

    private void Start()
    {
        //SceneManager.sceneLoaded += OnSceneLoaded;

        loadAdventure();

        _currentScene = SceneManager.GetSceneByName("Start");

        loadAllSmallScenes();
        //PreloadNextScene();
    }

    private void loadAllSmallScenes()
    {
        //Preparo una lista con todos los nombres de todas las escenas involucradas en esta aventura
        List<string> scenesInvolved = getScenesInvolvedInAdventure();

        for(int i = 0; i< scenesInvolved.Count; i++)
        {
            string name = scenesInvolved[i];
            if (name == "") continue;
            print("el nombre es "+ name);
            AsyncOperation asyncOp = SceneManager.LoadSceneAsync(name, LoadSceneMode.Additive);
            asyncOp.allowSceneActivation = true;
            _preloadedScene = new KeyValuePair<string, AsyncOperation>(name, asyncOp);
        }
    }

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

    public void SetCurrentStage(Stage st)
    {
        _currentStage = st;
        InitCurrentStage();
    }

    /// <summary>
    /// Inicia _currentStage con la siguiente aventura en la lista, y la quita de esta
    /// </summary>
    private void InitCurrentStage()
    {
        _currentStage.Init(adventureStages.Peek());
        //adventureStages.Dequeue();
        //PreloadNextScene();
    }

    /// <summary>
    /// Selecciona como escena activa la escena que se acaba de cargar, actualiza _currentScene y descarga la anterior escena.
    /// </summary>
    /// <param name="scene"></param>
    /// <param name="mode"></param>
    //void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    //{
    //    //Scene lastScene = _currentScene;
    //    //_currentScene = scene;
    //    //SceneManager.SetActiveScene(_currentScene);
    //    //if (lastScene != null)
    //    //    SceneManager.UnloadSceneAsync(lastScene);
    //}

    /// <summary>
    /// Carga la siguiente escena al 90% y la guarda en _preloadedScene
    /// </summary>
    //private void PreloadNextScene()
    //{
    //    //En caso de que se haya terminado nos vamos a la escena de fin
    //    string name = (adventureStages.Count == 0) ? "End" : adventureStages.Peek().stage;
    //    AsyncOperation asyncOp = SceneManager.LoadSceneAsync(name, LoadSceneMode.Additive);
    //    asyncOp.allowSceneActivation = false;
    //    _preloadedScene = new KeyValuePair<string, AsyncOperation>(name, asyncOp);
    //}

    /// <summary>
    /// Activa la escena precargada, deja que se complete la carga al 100%
    /// </summary>
    //private void ActivatePreloadedScene()
    //{
        //_preloadedScene.Value.allowSceneActivation = true;
    //}

    /// <summary>
    /// Metodo que devuelve los datos que le corresponden a la siguiente fase
    /// </summary>
    /// <returns>Datos de la fase que ha de ejecutarse ahora</returns>
    //public static AdventureInfo getNextAdventureInfo()
    //{
    //    if (adventureStages.Count <= 0) return null;

    //    AdventureInfo nextStage = adventureStages.Dequeue();

    //    return nextStage;
    //}

    /// <summary>
    /// La fase ha terminado asi que cargamos la escena que permita ejecutar la siguiente
    /// o nos vamos a la escena del final en caso de que no nos queden datos
    /// </summary>
    //public void continueToNextPhase()
    //{
    //    if (SceneManager.GetActiveScene().name == adventureStages.Peek().stage)
    //    {
    //        InitCurrentStage();
    //    }
    //    else
    //        ActivatePreloadedScene();
    //}

    private void loadAdventure()
    {
        //Me hago con el JSON, saco toda la info que tenga dentro y genero un diccionario a partir de esta 
        string json = adventure.adventureFile.ToString();
        var adventureData = JObject.Parse(json);


        //Voy a recorrer todas las fases que existan en este json
        JArray misFases = (JArray)adventureData["fases"];

        //Preparamos las fases iniciales y finales
        AdventureInfo start = new AdventureInfo();      start.stage = "Start";
        AdventureInfo end = new AdventureInfo();        end.stage = "AdventureEnd";

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
            }
        }
        //adventureStages.Enqueue(end);
    }


    /// <summary>
    /// este método tiene como objetivo ser llamado por las múltiples fases por las que vamos a pasar para que estas
    /// Al terminar lo llamen para eliminar esa fase de la cola y poder pasar a la siguiente
    /// </summary>
    public void GoToNextPhase()
    {
        adventureStages.Dequeue();
    }

    /// <summary>
    /// Este método tiene como objetivo devolver la fase que se encuentra ahora en primer lugar en la cola de estas
    /// </summary>
    /// <returns></returns>
    public string getCurrentStageType()
    {
        return adventureStages.Peek().stage;
    }

}