using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LoadScreenController : MonoBehaviour
{
    [SerializeField]
    Animator blackScreenAnimator;

    [SerializeField]
    GameObject loadingIconGameObject;
    
    /// <summary>
    /// Inicia la animacion de transicion entre escenas
    /// </summary>
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

    /// <summary>
    /// Este metodo se va a invocar constantemente esperando a que al gamemanager confirme que la siguiente escena est� cargara
    /// Cuando lo haga, se dejar� de repetir este invoke y se pasar� a la siguiente escena
    /// </summary>
    private void WaitForSceneLoad()
    {
        //Si no esta la escena lista hay que esperar
        if (!GameManager.GetInstance().IsCurrentPhaseSceneReady()) print("Esperando a que termine de cargar la escena");
        //PEro en caso de que la escena ya est� cargada podemos cancelar todas estas invocaciones repetitivas y empezar la transici�n a la siguiente escena
        else
        {
            CancelInvoke();
            Invoke("EndSceneTransition", 2); //Este tiempo es para que la pantalla de carga no sea instantanea (lo cual quedar�a raro con la animaci�n cortandose al instante en escenas ligeras)
        }
    }


    /// <summary>
    /// Metodo que supone el final de la transicion de la escena 
    /// Se llama al gamemanager para que de el paso y a la pantalla de carga para que termine su animaci�n de carga
    /// </summary>
    public void EndSceneTransition()
    {
        loadingIconGameObject.SetActive(false);
        blackScreenAnimator.SetBool("StartTransition", false);
        blackScreenAnimator.SetBool("EndTransition", true);
    }
}
