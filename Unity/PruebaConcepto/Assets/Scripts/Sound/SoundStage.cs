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

    //Audio que se va a usar en la fase
    AudioClip audioClip;

    bool audioStarted = false;

    public override void Init(AdventureInfo data)
    {
        soundData = (SoundInfo)data;

        Debug.Log(soundData.nombreSonido);
        audioClip = Resources.Load<AudioClip>("AdventureSounds/" + soundData.nombreSonido);
        audioSource.clip = audioClip;
        descriptionText.text = soundData.descripcionFase;

    }

    public void Update()
    {
        //HEmos terminado de reproducir el audio
        if (audioStarted && !audioSource.isPlaying) {
            audioSource.Pause();
            NextScene();
        }
    }

    public void ToggleSound()
	{
        audioStarted = !audioStarted;

        if(audioStarted)
            audioSource.Play();
        else
            audioSource.Pause();
    }

    public void NextScene()
    {
        GameManager.GetInstance().StageCompleted();
    }
    public override void OnStageEnd()
    {

    }

}
