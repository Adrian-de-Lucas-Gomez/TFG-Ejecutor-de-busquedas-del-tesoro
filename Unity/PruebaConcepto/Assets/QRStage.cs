using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class QRStage : Stage
{
    [Tooltip("Escaner de QR")]
    [SerializeField] QRScanner scanner;

    QRInfo qrData;
    string qrValue;
    bool changeSceneRequest = false;

    private void Start()
    {
        //GameManager.getInstance().SetCurrentStage(this);
    }

	private void Update()
	{
		if(changeSceneRequest)
            //GameManager.getInstance().continueToNextPhase();
            GameManager.getInstance().GoToNextPhase();
    }

    public override void Init(AdventureInfo data)
    {
        qrData = (QRInfo)data;
        qrValue = qrData.QRValue;
        changeSceneRequest = false;
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
