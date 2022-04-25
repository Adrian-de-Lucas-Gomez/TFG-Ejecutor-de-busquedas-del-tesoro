using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class LogicManager : MonoBehaviour
{

    [SerializeField]
    Button hintButton;

    [SerializeField]
    ContinueButtonController continueButtonController;

    [SerializeField]
    HintController hintController;

    [SerializeField]
    LoadScreenController loadScreenController;

    [SerializeField]
    SuccessIconController successIconController;

    // Start is called before the first frame update
    void Start()
    {
        //nextPhaseButton.gameObject.active = false;
        hintButton.gameObject.active = false;
    }


    public void EnableHints()
    {
        hintButton.gameObject.SetActive(true);
    }

    public void DisableHints()
    {
        hintButton.gameObject.SetActive(false);
    }

    //Metodo que pide al gamemanager la informaci�n de la fase en la que nos encontramos y muestra la pista que tiene asociada
    public void ShowHint()
    {
        //hintText.text = GameManager.getInstance().getCurrentStage().hint;
        hintController.ShowHint();
    }

    //Metodo que esconde el panel encargado de mostrar las pistas de cada fase
    public void HideHint()
    {
        //hintPanel.active = false;
    }

    public void ShowCorrect(bool correct)
    {
        successIconController.showCorrect(correct);
    }

    //Metodo que tiene como objetivo mostrar el boton que te permite pasar a la siguiente fase
    public void PhaseCompleted()
    {
        continueButtonController.Appear();
    }

    public void StartSceneTransition()
    {
        loadScreenController.StartSceneTransition();
    }
}
