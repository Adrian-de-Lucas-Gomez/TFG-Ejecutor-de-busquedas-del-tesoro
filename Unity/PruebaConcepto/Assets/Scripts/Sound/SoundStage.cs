using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

public class SoundStage : Stage
{
    SoundInfo soundData;      //Datos referentes a la imagen

    [SerializeField]
    AudioSource audioSource;

    [Tooltip("Texto que da una explicacion en la fase")]
    [SerializeField] TextMeshProUGUI descriptionText;

    [Tooltip("Boton para reproducir el audio de la fase")]
    [SerializeField]Toggle toggle;

    //Audio que se va a usar en la fase
    AudioClip audioClip;

    bool audioStarted = false;

    public override void Init(AdventureInfo data)
    {
        soundData = (SoundInfo)data;

        audioClip = Resources.Load<AudioClip>("AdventureSounds/" + soundData.nombreSonido);
        audioSource.clip = audioClip;
        descriptionText.text = soundData.descripcionFase;

    }

    public void Update()
    {
        //Hemos terminado de reproducir el audio
        if (audioStarted && !audioSource.isPlaying) {
            toggle.isOn = false;
            NextScene();
        }
    }

    public void ToggleSound()
	{
        if (toggle.isOn)
        {
            audioStarted = true;
            audioSource.Play();
        }
        else
        {
            audioStarted = false;
            audioSource.Pause();
        }
    }

    public void NextScene()
    {
        GameManager.GetInstance().StageCompleted();
    }
    public override void OnStageEnd()
    {
        //Esto es necesario en caso de que se salte la fase antes de escuchar el audio entero
        //Evita que avances de fase y continues escuchando el audio
        audioSource.Stop();
        toggle.isOn = false;
    }

}
