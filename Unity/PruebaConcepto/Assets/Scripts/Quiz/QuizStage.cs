using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class QuizStage : Stage
{
    [Tooltip ("Prefab de las posibles respuestas de un quiz")]
    [SerializeField]
    GameObject quizAnswerPrefab;

    [Tooltip("Texto del quiz en el se va a mostrar la pregunta")]
    [SerializeField]
    Text quizQuestionText;

    QuizInfo quizData;                                      //Datos del quiz
    List<GameObject> quizAnswers = new List<GameObject>();  //Lista de gameobjects que representaran las posibles respuestas de la fase
    Vector2 UIPosition = new Vector2();                     //Posicion que vamos a utilizar para situar cada una de nuestras respuestas

    private void Start()
    {
        GameManager.getInstance().SetCurrentStage(this);
    }

    public override void Init(AdventureInfo data)
    {
        quizData = (QuizInfo)data;
        quizQuestionText.text = quizData.pregunta;

        //Despliego las posibles respuestas por pantalla
        UIPosition = new Vector2(0, 120);

        quizAnswers.Clear();
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
            UIPosition -= new Vector2(0, 50);
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

        //En caso de que haya resuelto bien el quiz
        if (i == quizAnswers.Count)
        {
            print("Well Done");
            GameManager.getInstance().continueToNextPhase(); 
        }
    }
}
