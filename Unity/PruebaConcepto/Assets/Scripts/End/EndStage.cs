using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EndStage : MonoBehaviour
{
    //Metodo que tiene como objetivo terminar con la ejecucion de la aventura
    public void StopPlaying()
    {
#if UNITY_EDITOR
        //Si estamos en el editor salimos del modo play
        UnityEditor.EditorApplication.isPlaying = false;
#else
        //Si estamos en la aplicacion final nos salimos de esta
        Application.Quit();
#endif

    }
}
