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
    [SerializeField]
    GameObject nextBtn;

    public override void Init(AdventureInfo data)
    {
        inputTextData = (InputTextInfo)data;

        Debug.Log(inputTextData.codigo);
    }

    public void CheckCode()
    {
        if (inputField.text == inputTextData.codigo)
        {
            inputField.interactable = false;
            info.color = Color.green;
            info.text = "Código correcto, pasa a la siguiente fase.";
            inputFieldObject.SetActive(false);
            nextBtn.SetActive(true);
        }
    }

    public void NextScene()
    {
        GameManager.getInstance().GoToNextPhase();
    }

}