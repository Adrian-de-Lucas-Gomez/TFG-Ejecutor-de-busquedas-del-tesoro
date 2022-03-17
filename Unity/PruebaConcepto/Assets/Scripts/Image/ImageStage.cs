using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class ImageStage : Stage
{
    ImageInfo imageData;      //Datos referentes a la imagen

    [Tooltip("Imagen que se va a usar en la fase")]
    [SerializeField]
    Image imageObject;

    public override void Init(AdventureInfo data)
    {
        imageData = (ImageInfo)data;

        Debug.Log(imageData.nombreImagen);

        imageObject.sprite = Resources.Load<Sprite>("AdventureImages/" + imageData.nombreImagen);
    }

    public void NextScene()
    {
        print("You're done looking at the picture...");
        GameManager.getInstance().GoToNextPhase();
    }
   
}

