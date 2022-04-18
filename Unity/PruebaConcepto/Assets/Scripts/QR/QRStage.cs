using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class QRStage : Stage
{
    [Tooltip("Escaner de QR")]
    [SerializeField] QRScanner scanner;

    [SerializeField] GameObject nextPanel;

    QRInfo qrData;
    string qrValue;
    bool changeSceneRequest = false;

    private void Start()
    {
        //GameManager.getInstance().SetCurrentStage(this);
    }

	private void Update()
	{
        //if (changeSceneRequest /*|| Input.GetMouseButtonDown(0) || Input.touchCount > 0*/)
        //    GameManager.getInstance().GoToNextPhase();
    }

    public void MoveToNextPhase()
	{
        //nextPanel.SetActive(false);
        GameManager.getInstance().StageCompleted();
    }

    public override void Init(AdventureInfo data)
    {
        nextPanel.SetActive(false);
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
            nextPanel.SetActive(true);
            MoveToNextPhase();
        }
	}
}
