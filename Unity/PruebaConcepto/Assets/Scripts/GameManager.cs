using Newtonsoft.Json.Linq;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{

    public static List<AdventureStage> adventureStages = new List<AdventureStage>();

    static GameManager _instance;
    public static GameManager getInstance()
    {
        return _instance;
    }

    /// <summary>
    /// Metodo que devuelve los datos que le corresponden a la siguiente fase
    /// </summary>
    /// <returns></returns>
    public static AdventureStage getNextAdventureStageInfo()
    {
        if (adventureStages.Count <= 0) return null;

        AdventureStage nextStage = adventureStages[0];
        adventureStages.RemoveAt(0);
        return nextStage;
    }

    public static void continueToNextPhase()
    {
        //En caso de que se haya terminado nos vamos a la escena de fin
        if (adventureStages.Count == 0)
            SceneManager.LoadScene("End");
        //Si no nos vamos a la siguiente escena
        else
            SceneManager.LoadScene(adventureStages[0].stage);
    }



    void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(this);
        }
        else
        {
            Destroy(this);
        }
    }


    private void Start()
    {
        //Me hago con el JSON, saco toda la info que tenga dentro y genero un diccionario a partir de esta 
        string json = File.ReadAllText(Application.dataPath + "/answers.json");
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
                        adventureStages.Add(newQuiz);
                        break;
                    }
            }
        }

        //Nos pasamos a la primera escena
        SceneManager.LoadScene(adventureStages[0].stage);

    }

}

