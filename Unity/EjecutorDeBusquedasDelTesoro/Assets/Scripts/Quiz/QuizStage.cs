using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

public class QuizStage : Stage
{
    [Tooltip ("Panel de Answers")]
    [SerializeField]
    Transform panelAnswers;

    [Tooltip("Texto del quiz en el se va a mostrar la pregunta")]
    [SerializeField]
    TextMeshProUGUI quizQuestionText;

    QuizInfo quizData;                                      //Datos del quiz

    public override void Init(AdventureInfo data)
    {
        quizData = (QuizInfo)data;
        quizQuestionText.text = quizQuestionText.text.Replace("\r", "");
        quizQuestionText.text = quizData.pregunta;

        //Despliego las posibles respuestas por pantalla

        untoggleAll();
        clearAnswers();
        displayPossibleAnswers();
    }

    private void clearAnswers()
	{
        //Ponemos el color de fondo por defecto 
        for (int x = 0; x < quizData.respuestas.Count; x++)
        {
            panelAnswers.GetChild(x).GetComponent<QuizAnswer>().setDefaultColor();
        }

        //Las desactivamos
        foreach(Transform o in panelAnswers)
		{
            o.gameObject.SetActive(false);
		}

    }

    private void untoggleAll()
	{
        foreach (Transform o in panelAnswers)
        {
            o.GetComponent<Toggle>().isOn = false;
        }
    }

    private void displayPossibleAnswers()
    {
        //Meto tantas respuestas en pantalla como datos haya sacado del JSON
        //Lo hago una debajo de otra
        for (int i = 0; i < quizData.respuestas.Count; i++)
        {
            Transform answer = panelAnswers.GetChild(i);
            answer.gameObject.SetActive(true);
            answer.GetComponent<QuizAnswer>().setAnswertext(quizData.respuestas[i].text);
        }
    }

    public void applySelection()
    {
        //Recorro mis respuestas, en caso de haber respondido correctamente el estado actual de cada una sera el mismo
        //que el de los datos leidos de json
        int i = 0;
        while (i < quizData.respuestas.Count)
        {
            if (panelAnswers.GetChild(i).GetComponent<QuizAnswer>().isAnswerSelected() != quizData.respuestas[i].isCorrect)
			{
                untoggleAll();
                GameManager.GetInstance().PlaySound("Incorrect");
                break;
            }
            i++;
        }

        //En caso de que haya resuelto bien el quiz
        if (i == quizData.respuestas.Count)
        {
            for (int x = 0; x < quizData.respuestas.Count; x++)
            {
                //Se pintan en verde las correctas
				if (quizData.respuestas[x].isCorrect)
				{
                    panelAnswers.GetChild(x).GetComponent<QuizAnswer>().setCorrectColor();
                }
            }

            print("Well Done");
            GameManager.GetInstance().PlaySound("Correct");
            GameManager.GetInstance().StageCompleted();
        }
    }

    public override void OnStageEnd()
    {

    }
}
