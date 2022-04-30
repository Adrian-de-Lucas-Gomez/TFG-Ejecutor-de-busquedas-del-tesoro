using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class EndStage : MonoBehaviour
{
	[SerializeField]
	TextMeshProUGUI endText;

	private void Start()
	{
		float skippedPhases = GameManager.GetInstance().GetSkippedPhases();
		float totalPhases = GameManager.GetInstance().GetTotalPhases();
		float completedPhases = totalPhases - skippedPhases;
		float completedPercetage = completedPhases * 100 / totalPhases;
		endText.text = "Fases completadas: "+ completedPhases + "\n"
			+ "Fases saltadas: " + skippedPhases + "\n"
			+ "Porcentaje de fases completadas: " + System.Math.Round(completedPercetage,2) + "%";
	}
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
