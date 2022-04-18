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


    public override void Init(AdventureInfo data)
    {
        inputTextData = (InputTextInfo)data;

        Debug.Log(inputTextData.codigo);
    }

    public void CheckCode()
    {
        if (inputField.text.ToLower() == inputTextData.codigo.ToLower())
        {
            inputField.interactable = false;
            info.color = Color.green;
            info.text = "Código correcto, pasa a la siguiente fase.";
            inputFieldObject.SetActive(false);
            NextScene();
        }
    }

    public void NextScene()
    {
        GameManager.getInstance().StageCompleted();
    }

}