using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ContinueButtonController : MonoBehaviour
{
    Button nextPhaseButton;
    Animator nextPhaseButtonAnimator;

    [Tooltip("Referencia a Logic Manager")]
    [SerializeField]
    LogicManager logicManager;

    void Start()
    {
        nextPhaseButton = gameObject.GetComponent<Button>();
        nextPhaseButton.interactable = false;
        nextPhaseButtonAnimator = gameObject.GetComponent<Animator>();
    }

    public void Appear()
    {
        nextPhaseButtonAnimator.SetBool("Aparecer", true);
        nextPhaseButtonAnimator.SetBool("Desaparecer", false);
        nextPhaseButton.IsInteractable();
    }

    public void SetButtonInteractable()
    {
        nextPhaseButton.interactable = true;
    }

    public void Disappear()
    {
        GameManager.GetInstance().PlaySound("ButtonPress3");
        GameManager.GetInstance().EndCurrentStage();
        nextPhaseButton.interactable = false;
        nextPhaseButtonAnimator.SetBool("Aparecer", false);
        nextPhaseButtonAnimator.SetBool("Desaparecer", true);
        logicManager.StartSceneTransition();
    }

}
