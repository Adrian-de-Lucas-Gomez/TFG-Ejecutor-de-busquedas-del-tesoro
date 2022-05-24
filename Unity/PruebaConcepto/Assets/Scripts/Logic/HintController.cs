using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;


public class HintController : MonoBehaviour
{
    [Tooltip("Texto de pista")]
    [SerializeField]
    TextMeshProUGUI hintText;

    Animator hintAnimator;

    [Tooltip("Referencia a Logic Manager")]
    [SerializeField]
    LogicManager logicManager;


    void Start()
    {
        hintAnimator = gameObject.GetComponent<Animator>();
    }

    /// <summary>
    /// Metodo que pide al gamemanager la información de la fase en la que nos encontramos y muestra la pista que tiene asociada
    /// </summary>
    public void ShowHint()
    {
        GameManager.GetInstance().PlaySound("ButtonPress3");
        hintText.text = GameManager.GetInstance().GetCurrentStage().hint;
        hintAnimator.SetBool("Aparecer", true);
        hintAnimator.SetBool("Desaparecer", false);
    }

    /// <summary>
    /// Metodo que esconde el panel encargado de mostrar las pistas de cada fase
    /// </summary>
    public void HideHint()
    {
        GameManager.GetInstance().PlaySound("ButtonPress2");
        hintAnimator.SetBool("Aparecer", false);
        hintAnimator.SetBool("Desaparecer", true);
    }

    /// <summary>
    /// Metodo para saltar fase
    /// </summary>
    public void Cheat()
    {
        GameManager.GetInstance().EndCurrentStage();
        GameManager.GetInstance().SkippedPhase();
        logicManager.StartSceneTransition();
        HideHint();
    }
}
