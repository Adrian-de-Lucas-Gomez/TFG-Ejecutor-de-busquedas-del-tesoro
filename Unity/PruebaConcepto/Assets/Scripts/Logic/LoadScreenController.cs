using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LoadScreenController : MonoBehaviour
{
    [SerializeField]
    Animator blackScreenAnimator;


    [SerializeField]
    GameObject loadingIconGameObject;
    


    public void StartSceneTransition()
    {
        blackScreenAnimator.SetBool("StartTransition", true);
        blackScreenAnimator.SetBool("EndTransition", false);
    }

    void ShowLoadScreenDetails()
    {
        GameManager.GetInstance().GoToNextPhase();
        InvokeRepeating("WaitForSceneLoad", 0,1);
        loadingIconGameObject.SetActive(true);
    }

    private void WaitForSceneLoad()
    {
        //Si no esta la escena lista hay que esperar
        if (!GameManager.GetInstance().IsCurrentPhaseSceneReady()) print("Esperando a que termine de cargar la escena");
        //PEro en caso de que la escena ya est� cargada podemos cancelar todas estas invocaciones repetitivas y empezar la transici�n a la siguiente escena
        else
        {
            CancelInvoke();
            Invoke("EndSceneTransition", 2);
        }
    }

    public void EndSceneTransition()
    {
        loadingIconGameObject.SetActive(false);
        blackScreenAnimator.SetBool("StartTransition", false);
        blackScreenAnimator.SetBool("EndTransition", true);
    }
}
