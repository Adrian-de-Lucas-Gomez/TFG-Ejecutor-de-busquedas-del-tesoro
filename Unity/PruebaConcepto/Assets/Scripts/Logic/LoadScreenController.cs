using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LoadScreenController : MonoBehaviour
{
    [SerializeField]
    Animator blackScreenAnimator;

    


    public void StartSceneTransition()
    {
        blackScreenAnimator.SetBool("StartTransition", true);
        blackScreenAnimator.SetBool("EndTransition", false);
    }

    void ShowLoadScreenDetails()
    {
        GameManager.getInstance().GoToNextPhase();
        InvokeRepeating("WaitForSceneLoad", 0,1);
    }

    private void WaitForSceneLoad()
    {
        //Si no esta la escena lista hay que esperar
        if (!GameManager.getInstance().IsCurrentPhaseSceneReady()) print("Esperando a que termine de cargar la escena");
        //PEro en caso de que la escena ya esté cargada podemos cancelar todas estas invocaciones repetitivas y empezar la transición a la siguiente escena
        else
        {
            CancelInvoke();
            Invoke("EndSceneTransition", 2);
        }
    }

    public void EndSceneTransition()
    {
        blackScreenAnimator.SetBool("StartTransition", false);
        blackScreenAnimator.SetBool("EndTransition", true);
    }
}
