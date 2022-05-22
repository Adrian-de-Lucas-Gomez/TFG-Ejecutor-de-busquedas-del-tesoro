using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;


public class StartAdventure : MonoBehaviour
{
    [SerializeField]
    MasterObject master;

    [SerializeField]
    int tiempoEspera = 5;

    [Tooltip("Texto que muestra el nombre de la aventura")]
    [SerializeField] TextMeshProUGUI adventureNameText;

    void Start()
    {
        adventureNameText.text= GameManager.GetInstance().GetAdventureName();
        Invoke("StartGame", tiempoEspera);
    }

    public void StartGame()
    {
        GameManager.GetInstance().StageCompleted();
    }
}
