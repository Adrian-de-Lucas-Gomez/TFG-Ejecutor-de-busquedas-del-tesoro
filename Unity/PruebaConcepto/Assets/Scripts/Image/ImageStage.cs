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

    public override void Init(AdventureInfo data)
    {
        imageData = (ImageInfo)data;

        Debug.Log(imageData.nombreImagen);

        imageObject.sprite = Resources.Load<Sprite>("AdventureImages/" + imageData.nombreImagen);

        descriptionText.text = imageData.descripcionFase;
    }

    public void NextScene()
    {
        print("You're done looking at the picture...");
        GameManager.getInstance().GoToNextPhase();
    }
   
}

