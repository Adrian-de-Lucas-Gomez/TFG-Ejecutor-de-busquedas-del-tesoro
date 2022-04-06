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
    [SerializeField]
    GameObject nextBtn;

    //Audio que se va a usar en la fase
    AudioClip audioClip;

    public override void Init(AdventureInfo data)
    {
        soundData = (SoundInfo)data;

        Debug.Log(soundData.nombreSonido);

        audioClip = Resources.Load<AudioClip>("AdventureSounds/" + soundData.nombreSonido);
        audioSource.clip = audioClip;
    }

    public void PlaySound()
	{
        audioSource.Play();
        playBtn.SetActive(false);
        pauseBtn.SetActive(true);
    }

    public void PauseSound()
	{
        audioSource.Pause();
        playBtn.SetActive(true);
        pauseBtn.SetActive(false);
    }

    public void NextScene()
    {
        GameManager.getInstance().GoToNextPhase();
    }

}
