using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ContinueButtonController : MonoBehaviour
{
    Button nextPhaseButton;
    Animator nextPhaseButtonAnimator;

    [SerializeField]
    LogicManager logicManager;

    // Start is called before the first frame update
    void Start()
    {
        nextPhaseButton = gameObject.GetComponent<Button>();
        nextPhaseButtonAnimator = gameObject.GetComponent<Animator>();
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void Appear()
    {
        nextPhaseButtonAnimator.SetBool("Aparecer", true);
        nextPhaseButtonAnimator.SetBool("Desaparecer", false);
    }


    public void Disappear()
    {
        nextPhaseButtonAnimator.SetBool("Aparecer", false);
        nextPhaseButtonAnimator.SetBool("Desaparecer", true);
        logicManager.StartSceneTransition();
    }



}
