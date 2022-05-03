using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine.UI;
using UnityEngine;

public class QRStage : Stage
{
    [Tooltip("Escaner de QR")]
    [SerializeField] QRScanner scanner;

    [SerializeField] GameObject nextPanel;

    [SerializeField] TextMeshProUGUI QRValueText;

    QRInfo qrData;
    string qrValue;
    bool changeSceneRequest = false;

    private Color correct = new Color(0.0f, 1.0f, 0.0f, 1.0f);
    private Color error = new Color(1.0f, 0.0f, 0.0f, 1.0f);
    private Color neutral = new Color(1.0f, 1.0f, 1.0f, 1.0f);

	private void Update()
	{
        if (changeSceneRequest)
        {
            scanner.EnableScanning(false);
            GameManager.GetInstance().StageCompleted();
            nextPanel.SetActive(true);
            changeSceneRequest = false;
        }

        //Si se ha detectado un codigo QR pasamos a comprobar si es el nuestro
        if (scanner.GetIsValueRead()) checkQR(scanner.GetValueRead());

        else SetQRTextValue("...", neutral);
    }

    public void MoveToNextPhase()
	{
        //nextPanel.SetActive(false);
        GameManager.GetInstance().StageCompleted();
    }

    public override void Init(AdventureInfo data)
    {
        nextPanel.SetActive(false);
        qrData = (QRInfo)data;
        qrValue = qrData.QRValue;
        changeSceneRequest = false;

        SetQRTextValue("...", neutral);

        scanner.EnableScanning(true);
    }

    public void checkQR(string qrMsg)
	{
        Debug.Log(qrMsg);

        if (qrValue == qrMsg)
		{
            Debug.Log("Well Done");
            GameManager.GetInstance().PlaySound("Correct");
            SetQRTextValue(qrMsg , correct);
            changeSceneRequest = true;
        }
        else
        {
            GameManager.GetInstance().PlaySound("Incorrect");
            SetQRTextValue(qrMsg, error);
        }
	}

    private void SetQRTextValue(string value, Color color)
    {
        QRValueText.gameObject.SetActive(false);

        QRValueText.text = value;
        QRValueText.color = color;

        QRValueText.gameObject.SetActive(true);
    }

    public override void OnStageEnd()
    {
        //Método por si necesitamos hacer algo al final de la fase
    }
}
