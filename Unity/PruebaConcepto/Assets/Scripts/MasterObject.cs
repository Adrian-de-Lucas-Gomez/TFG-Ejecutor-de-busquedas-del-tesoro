using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


/// <summary>
/// Este objeto se va a encargar de tener controlados todos los objetos de cada escena que forman una fase concreta
/// Lo que va a hacer es preguntar al gamemanager por la fase que toca ahora, y si no es la que la escena de este objeto
/// representa se desactivan los objetos de la misma hasta que llegue el momento de que SI le toque y entonces 
/// los activar� para poder jugar la fase concreta
/// </summary>
public class MasterObject : MonoBehaviour , Listener
{

    [SerializeField]
    GameObject sceneObjectsParent;
    [SerializeField]
    Stage myStage;

    //Tipos de fases en las que se puede encontrar este objeto
    enum StageType {Start, QuizStage, QRStage, ImageStage, ImageTargetStage,SoundStage,InputTextStage,GPSStage, End };

    //Fase que representa la escena en la que estamos, en sus representaciones de string como de enum
    [SerializeField]
    StageType myStageType;
    string myStageTypeStringRepresentation;

    //Bool que representa si la escene actual se est� ejecutando o no la escena que contiene  a este master object
    bool mySceneIsPlaying;

    // Start is called before the first frame update
    void Start()
    {
        //Nos ponemos como que no estamos ejecutando nuestra escena desde el principio y m�s tarde cuando haya que preguntar veremos si nos toca ejecutar a nosotros o no
        mySceneIsPlaying = false;

        //Dependiendo del tipo de escena en la que nos estemos ejecutando nos vamos a preparar para escuchar un valor concreto y otro
        switch (myStageType)
        {
            case StageType.Start:
                myStageTypeStringRepresentation = "Start";
                break;
            case StageType.QuizStage:
                myStageTypeStringRepresentation = "QuizStage";
                break;
            case StageType.QRStage:
                myStageTypeStringRepresentation = "QRStage";
                break;
            case StageType.ImageStage:
                myStageTypeStringRepresentation = "ImageStage";
                break;
            case StageType.ImageTargetStage:
                myStageTypeStringRepresentation = "ImageTargetStage";
                break;
            case StageType.SoundStage:
                myStageTypeStringRepresentation = "SoundStage";
                break;
            case StageType.InputTextStage:
                myStageTypeStringRepresentation = "InputTextStage";
                break;
            case StageType.GPSStage:
                myStageTypeStringRepresentation = "GPSStage";
                break;
            case StageType.End:
                myStageTypeStringRepresentation = "End";
                break;
        }
        //Por defecto desactivamos los objetos de esta escena
        sceneObjectsParent.SetActive(false);

        GameManager.getInstance().AddListener(this);
        Listen(GameManager.getInstance().GetCurrentStageType());
    }

    // Update is called once per frame
    void Update()
    {
    }

    public void Listen(string stageType)
    {
        //print("Me acaba de llegar el siguient mensage "+ stageType);
        //Si no estamos jugando esta escena pero nos toca porque nos lo dice el gamemanager nos activamos y si tenemos algo que ejecutar
        //se lo decimos al gamemanager para que este le de la info que necesita la fase que estemos almacenando
        if (!mySceneIsPlaying && stageType == myStageTypeStringRepresentation)
        {
            sceneObjectsParent.SetActive(true);
            mySceneIsPlaying = true;
            if (myStage != null) GameManager.getInstance().SetCurrentStage(myStage);
        }
        //En caso de que estuvieramos jugando nuestra fase pero el gamemanager ya no indica que estamos en la nuestra, significa que nos la hemos
        //pasado y que tenemos que desactivar nuestros objetos
        else if (mySceneIsPlaying && stageType != myStageTypeStringRepresentation)
        {
            stageFinished();
        }
    }

    //este m�todo tiene como objetivo que las fases una vez hayan terminado de ejecutarse que avisen a este padre para que limpie la escena porque la fase se ha acabado
    public void stageFinished()
    {
        mySceneIsPlaying = false;
        sceneObjectsParent.SetActive(false);
    }

    //Metodo que permite obtener si las escena en la que se encuentra este master object est� siendo ejecutada o no
    public bool getSceneIsPlaying()
    {
        return mySceneIsPlaying;
    }


}
