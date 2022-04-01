using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class GPSStage : Stage
{
    [Tooltip("Escaner de QR")]
    [SerializeField] GPSScanner scanner;


    [SerializeField] TextMeshProUGUI UILongitude;
    [SerializeField] TextMeshProUGUI UILatitude;

    GPSInfo gpsData;
    string GPSLongitude = "";
    string GPSLatitude = "";

    bool changeSceneRequest = false;

    private void Update()
    {
        if (changeSceneRequest /*|| Input.GetMouseButtonDown(0) || Input.touchCount > 0*/)
            GameManager.getInstance().GoToNextPhase();

        CheckGPSLocalization(scanner.GetLongitude(), scanner.GetLatitude());
    }

    public override void Init(AdventureInfo data)
    {
        gpsData = (GPSInfo)data;
        GPSLongitude = gpsData.GPSLongitude;
        GPSLatitude = gpsData.GPSLatitude;

        UILongitude.text = GPSLongitude;
        UILatitude.text = GPSLatitude;

        changeSceneRequest = false;
    }

    public void CheckGPSLocalization(float longitude, float latitude)
    {
        UILongitude.text = longitude.ToString();
        UILatitude.text = latitude.ToString();
    }
}