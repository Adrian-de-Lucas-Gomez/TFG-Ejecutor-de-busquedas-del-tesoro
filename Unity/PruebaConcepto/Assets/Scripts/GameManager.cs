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
    public static Queue<AdventureStage> adventureStages = new Queue<AdventureStage>();

    static GameManager _instance;
    public static GameManager getInstance()
    {
        return _instance;
    }

    void Awake()
    {
        //en caso de qu ela instancia no exista nos ponemos nosotros como instancia
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
        loadAdventure();

        //Nos pasamos a la primera escena
        SceneManager.LoadScene(adventureStages.Peek().stage);

    }

    /// <summary>
    /// Metodo que devuelve los datos que le corresponden a la siguiente fase
    /// </summary>
    /// <returns>Datos de la fase que ha de ejecutarse ahora</returns>
    public static AdventureStage getNextAdventureStageInfo()
    {
        if (adventureStages.Count <= 0) return null;

        AdventureStage nextStage = adventureStages.Dequeue();

        return nextStage;
    }

    /// <summary>
    /// La fase ha terminado asi que cargamos la escena que permita ejecutar la siguiente
    /// o nos vamos a la escena del final en caso de que no nos queden datos
    /// </summary>
    public static void continueToNextPhase()
    {
        //En caso de que se haya terminado nos vamos a la escena de fin
        if (adventureStages.Count == 0)
            SceneManager.LoadScene("End");
        //Si no nos vamos a la siguiente escena
        else
            SceneManager.LoadScene(adventureStages.Peek().stage);
    }

    private void loadAdventure()
	{
        //Me hago con el JSON, saco toda la info que tenga dentro y genero un diccionario a partir de esta 
        string json = adventure.adventureFile.ToString();
        var adventureData = JObject.Parse(json);


        //Voy a recorrer todas las fases que existan en este json
        JArray misFases = (JArray)adventureData["fases"];
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
    }

}