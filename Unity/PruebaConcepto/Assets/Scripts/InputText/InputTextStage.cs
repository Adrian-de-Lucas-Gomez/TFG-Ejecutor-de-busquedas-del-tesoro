using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

public class InputTextStage : Stage
{
    InputTextInfo inputTextData;      //Datos referentes a la imagen

    [SerializeField]
    TMP_InputField inputField;
    [SerializeField]
    TextMeshProUGUI info;
    [SerializeField]
    GameObject inputFieldObject;

    string answerObtained = "";

    public override void Init(AdventureInfo data)
    {
        inputTextData = (InputTextInfo)data;
        info.text = inputTextData.descripcionFase;

        Debug.Log(inputTextData.codigo);
    }

    public void CheckCode()
    {
        GameManager.GetInstance().PlaySound("ButtonPress2");
        foreach (string possibleAnswer in inputTextData.respuestasPosibles)
        {
            if (inputField.text.ToLower() == possibleAnswer.ToLower())
            {
                answerObtained = inputField.text;
                inputField.interactable = false;
                info.color = Color.green;
                info.text = "C�digo correcto, la respuesta era:"+answerObtained;
                GameManager.GetInstance().PlaySound("Correct");
                GameManager.GetInstance().StageCompleted();
            }
        }
        GameManager.GetInstance().PlaySound("Incorrect");
    }

    public override void OnStageEnd()
    {

    }

}