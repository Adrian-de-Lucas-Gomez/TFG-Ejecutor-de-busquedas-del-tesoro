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
    TMP_InputField inputField;
    [SerializeField]
    TextMeshProUGUI info;
    [SerializeField]
    GameObject playBtn;
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

    public void CheckCode()
	{
        if(inputField.text == soundData.codigo)
		{
            inputField.interactable = false;
            info.color = Color.green;
            info.text = "Código correcto, pasa a la siguiente fase.";
            playBtn.SetActive(false);
            nextBtn.SetActive(true);
		}
	}

    public void NextScene()
    {
        GameManager.getInstance().GoToNextPhase();
    }

}
