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

    void Start()
    {
        hintButton.gameObject.SetActive(false);
    }

    /// <summary>
    /// Muestra el boton de pista si existe pista
    /// </summary>
    /// <param name="currentPhase"></param>
    public void EnableHints(AdventureInfo currentPhase)
    {
        if (currentPhase.hint == "")
            hintButton.gameObject.SetActive(false);
        else
            hintButton.gameObject.SetActive(true);
    }

    /// <summary>
    /// Metodo que pide al gamemanager la informaci�n de la fase en la que nos encontramos y muestra la pista que tiene asociada
    /// </summary>
    public void ShowHint()
    {
        hintController.ShowHint();
    }

    public void ShowCorrect(bool correct)
    {
        successIconController.showCorrect(correct);
    }

    /// <summary>
    /// Metodo que tiene como objetivo mostrar el boton que te permite pasar a la siguiente fase
    /// </summary>
    public void PhaseCompleted()
    {
        continueButtonController.gameObject.SetActive(true);
        continueButtonController.Appear();
    }

    public void StartSceneTransition()
    {
        continueButtonController.gameObject.SetActive(false);
        loadScreenController.StartSceneTransition();
    }
}
