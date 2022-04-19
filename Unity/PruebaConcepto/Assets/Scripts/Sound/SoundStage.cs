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
    [SerializeField]
    GameObject playBtn;
    [SerializeField]
    GameObject pauseBtn;

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
            PauseSound();
            NextScene();
        }
    }

    public void PlaySound()
	{
        audioStarted = true;

        audioSource.Play();
        playBtn.SetActive(false);
        pauseBtn.SetActive(true);
    }

    public void PauseSound()
	{
        audioStarted = false;

        audioSource.Pause();
        playBtn.SetActive(true);
        pauseBtn.SetActive(false);
    }

    public void NextScene()
    {
        GameManager.getInstance().StageCompleted();
    }

}
