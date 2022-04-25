using System.Collections;
using System.Collections.Generic;
using System.IO;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;


public class ImageStage : Stage 
{
    ImageInfo imageData;      //Datos referentes a la imagen

    [Tooltip("Imagen que se va a usar en la fase")]
    [SerializeField]
    Image imageObject;

    [Tooltip("Texto que da una explicacion en la fase")]
    [SerializeField] TextMeshProUGUI descriptionText;

    [Tooltip("Tiempo minimo que tiene que pasar antes de que le mostremos al jugador le boton de pasar de fase")]
    [SerializeField] int tiempoEspera=5;

    public override void Init(AdventureInfo data)
    {
        imageData = (ImageInfo)data;

        Debug.Log(imageData.nombreImagen);

        imageObject.sprite = Resources.Load<Sprite>("AdventureImages/" + imageData.nombreImagen);
        descriptionText.text = imageData.descripcionFase;

        //Como en esta fase no hay mucho que hacer para el jugador a los segundos de espera le permitimos pasar a la siguiente fase
        Invoke("NextScene", tiempoEspera);
    }

    public void NextScene()
    {
        print("You're done looking at the picture...");
        GameManager.GetInstance().StageCompleted();
    }
    public override void OnStageEnd()
    {

    }
}

