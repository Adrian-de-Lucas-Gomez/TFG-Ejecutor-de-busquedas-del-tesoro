using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class LogicManager : MonoBehaviour
{
    [Tooltip("Boton de pista")]
    [SerializeField]
    Button hintButton;

    [Tooltip("Controlador de boton continuar")]
    [SerializeField]
    ContinueButtonController continueButtonController;

    [Tooltip("Controlador de pista")]
    [SerializeField]
    HintController hintController;

    [Tooltip("Controlador de pantalla de carga")]
    [SerializeField]
    LoadScreenController loadScreenController;

    [Tooltip("Controlador de icono de exito")]
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
        hintController.ShowHintPanel(false);
    }

    /// <summary>
    /// Oculta el boton de pasar de fase e inicia la animacion de transicion
    /// </summary>
    public void StartSceneTransition()
    {
        hintController.ShowHintPanel(false);
        continueButtonController.gameObject.SetActive(false);
        loadScreenController.StartSceneTransition();
    }
}
