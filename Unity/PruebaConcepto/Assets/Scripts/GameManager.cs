using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;



public class GameManager : MonoBehaviour
{

    public GameObject quizPrefab;
    public GameObject canvas;


    static GameManager _instance;
    public static GameManager getInstance()
    {
        return _instance;
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
        //Me hago con el JSON, saco toda la info que tenga dentro y la desserializo en un objeto
        //de tipo QuizInfo, el cual a su vez requiere deserializacion de la clase PossibleAnswer
        string json = File.ReadAllText(Application.dataPath + "/answers.json");
        QuizInfo quizData = JsonUtility.FromJson<QuizInfo>(json);
        Instantiate(quizPrefab,canvas.transform).GetComponent<QuizStage>().quizInit(quizData);
    }

}

