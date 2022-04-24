using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;


public class HintController : MonoBehaviour
{

    [SerializeField]
    TextMeshProUGUI hintText;

    Animator hintAnimator;

    [SerializeField]
    LogicManager logicManager;


    void Start()
    {
        hintAnimator = gameObject.GetComponent<Animator>();

    }

    //Metodo que pide al gamemanager la información de la fase en la que nos encontramos y muestra la pista que tiene asociada
    public void ShowHint()
    {
        hintText.text = GameManager.getInstance().getCurrentStage().hint;
        hintAnimator.SetBool("Aparecer", true);
        hintAnimator.SetBool("Desaparecer", false);
    }

    //Metodo que esconde el panel encargado de mostrar las pistas de cada fase
    public void HideHint()
    {
        hintAnimator.SetBool("Aparecer", false);
        hintAnimator.SetBool("Desaparecer", true);
        //hintPanel.active = false;
    }

    public void Cheat()
    {
        logicManager.StartSceneTransition();
        HideHint();
    }
}
