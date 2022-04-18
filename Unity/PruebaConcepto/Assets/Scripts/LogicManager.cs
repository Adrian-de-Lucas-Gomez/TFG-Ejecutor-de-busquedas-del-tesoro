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
    Button nextPhaseButton;

    [SerializeField]
    GameObject hintPanel;

    [SerializeField]
    TextMeshProUGUI hintText;

    // Start is called before the first frame update
    void Start()
    {
        nextPhaseButton.gameObject.active = false;
        hintButton.gameObject.active = false;
        hintPanel.active = false;
    }


    public void EnableHints()
    {
        hintButton.gameObject.active = true;
    }

    public void DisableHints()
    {
        hintButton.gameObject.active = false;
    }

    //Metodo que pide al gamemanager la información de la fase en la que nos encontramos y muestra la pista que tiene asociada
    public void ShowHint()
    {
        hintPanel.active = true;
        hintText.text = GameManager.getInstance().getCurrentStage().hint;
    }

    //Metodo que esconde el panel encargado de mostrar las pistas de cada fase
    public void HideHint()
    {
        hintPanel.active = false;
    }

    //Metodo que tiene como objetivo mostrar el boton que te permite pasar a la siguiente fase
    public void PhaseCompleted()
    {
        nextPhaseButton.gameObject.active = true;
    }

    //Metodo que esconde le boton que permite ir a la siguiente fase y avisa al gamemanager para que nos vayamos a la siguiente parte de la aventura
    public void ContinueToNextPhase()
    {
        nextPhaseButton.gameObject.active = false;
        GameManager.getInstance().GoToNextPhase();
    }
}
