using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class QRStage : MonoBehaviour
{
    [Tooltip("Escaner de QR")]
    [SerializeField] QRScanner scanner;

    QRInfo qrData;
    string qrValue;
    bool changeSceneRequest = false;

    private void Start()
    {
        qrInit((QRInfo)GameManager.getNextAdventureStageInfo());
    }

	private void Update()
	{
		if(changeSceneRequest)
            GameManager.continueToNextPhase();
    }

	public void qrInit(QRInfo data)
    {
        qrData = data;
        qrValue = qrData.QRValue;
    }

    public void checkQR(string qrMsg)
	{
		if (qrValue == qrMsg)
		{
            Debug.Log("Well Done");
            changeSceneRequest = true;
        }
	}
}
