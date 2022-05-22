using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

public class InputTextStage : Stage
{
    InputTextInfo inputTextData;

    [SerializeField]
    TMP_InputField inputField;
    [SerializeField]
    TextMeshProUGUI info;

    string answerObtained = "";

    public override void Init(AdventureInfo data)
    {
        inputField.interactable = true;
        info.color = Color.white;
        inputField.text = "";

        inputTextData = (InputTextInfo)data;
        info.text = inputTextData.descripcionFase;
    }

    /// <summary>
    /// Metodo para comprobar si el codigo es correcto
    /// </summary>
    public void CheckCode()
    {
        GameManager.GetInstance().PlaySound("ButtonPress2");
        bool correct = false;
        foreach (string possibleAnswer in inputTextData.respuestasPosibles)
        {
            if (inputField.text.ToLower() == possibleAnswer.ToLower())
            {
                answerObtained = inputField.text;
                inputField.interactable = false;
                info.color = Color.green;
                info.text = "Código correcto, la respuesta era: "+answerObtained;
                GameManager.GetInstance().PlaySound("Correct");
                GameManager.GetInstance().StageCompleted();
                correct = true;
            }
        }

        if(!correct) GameManager.GetInstance().PlaySound("Incorrect");
    }

    public override void OnStageEnd()
    {

    }

}