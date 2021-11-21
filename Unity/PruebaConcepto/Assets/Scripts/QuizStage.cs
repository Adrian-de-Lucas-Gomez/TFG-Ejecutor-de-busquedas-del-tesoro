using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.UI;

public class QuizStage : MonoBehaviour
{
    [Tooltip ("Prefab de las posibles respuestas de un quiz")]
    [SerializeField]
    GameObject quizAnswerPrefab;

    [Tooltip("Texto del quiz en el se va a mostrar la pregunta")]
    [SerializeField]
    Text quizQuestion;

    QuizInfo quizData;                                      //Datos del quiz
    List<GameObject> quizAnswers = new List<GameObject>();  //Lista de gameobjects que representaran las posibles respuestas de la fase
    Vector2 UIPosition = new Vector2();                     //Posicion que vamos a utilizar para situar cada una de nuestras respuestas


    void Start()
    {
        //Me hago con el JSON, saco toda la info que tenga dentro y la desserializo en un objeto
        //de tipo QuizInfo, el cual a su vez requiere deserializacion de la clase PossibleAnswer
        string json = File.ReadAllText(Application.dataPath + "/answers.json");
        quizData = JsonUtility.FromJson<QuizInfo>(json);
        quizQuestion.text = quizData.pregunta;

        //Despliego las posibles respuestas por pantalla
        UIPosition = new Vector2(0, 120);
        displayPossibleAnswers();
    }

    private void displayPossibleAnswers()
    {
        //Meto tantas respuestas en pantalla como datos haya sacado del JSON
        //Lo hago una debajo de otra
        for (int i = 0; i < quizData.respuestas.Count; i++)
        {
            quizAnswers.Add(Instantiate(quizAnswerPrefab, transform));
            quizAnswers[i].GetComponent<RectTransform>().anchoredPosition = UIPosition;
            quizAnswers[i].GetComponent<QuizAnswer>().setAnswertext(quizData.respuestas[i].text);
            UIPosition -= new Vector2(0, 100);
        }
    }

    public void applySelection()
    {
        //Recorro mis respuestas, en caso de haber respondido correctamente el estado actual de cada una sera el mismo
        //que el de los datos leidos de json
        int i = 0;
        while (i < quizAnswers.Count)
        {
            if (quizAnswers[i].GetComponent<QuizAnswer>().isAnswerSelected() != quizData.respuestas[i].isCorrect) 
                break;
            i++;
        }

        //En caso de que haya resuelto biene el quiz
        if (i == quizAnswers.Count) print("Well Done");
    }

}
