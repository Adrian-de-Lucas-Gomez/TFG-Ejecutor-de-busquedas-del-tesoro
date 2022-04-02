using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;

public class GPSStage : Stage
{
    [Tooltip("Escaner de QR")]
    [SerializeField] GPSScanner scanner;


    [SerializeField] TextMeshProUGUI UILongitude;
    [SerializeField] TextMeshProUGUI UILatitude;

    [SerializeField] TextMeshProUGUI UILongitudeObj;
    [SerializeField] TextMeshProUGUI UILatitudeObj;

    [SerializeField] RectTransform arrow;

    GPSInfo gpsData;
    string GPSLongitude = "";
    string GPSLatitude = "";

    bool changeSceneRequest = false;

    private void Update()
    {
        if (changeSceneRequest /*|| Input.GetMouseButtonDown(0) || Input.touchCount > 0*/)
            GameManager.getInstance().GoToNextPhase();

        CalculatePathDirection(scanner.GetLongitude(), scanner.GetLatitude());

        CheckGPSLocalization(scanner.GetLongitude(), scanner.GetLatitude());

        arrow.Rotate(new Vector3(0, 0, 1), (Mathf.PI / 2));
    }


    public override void Init(AdventureInfo data)
    {
        gpsData = (GPSInfo)data;
        GPSLongitude = gpsData.GPSLongitude;
        GPSLatitude = gpsData.GPSLatitude;

        UILongitudeObj.text = GPSLongitude;
        UILatitudeObj.text = GPSLatitude;

        changeSceneRequest = false;
    }

    private void CheckGPSLocalization(float longitude, float latitude)
    {
        UILongitude.text = longitude.ToString();
        UILatitude.text = latitude.ToString();
    }

    private void CalculatePathDirection(float longitude, float latitude)
    {
        Vector2 pathDir = new Vector2(float.Parse(gpsData.GPSLongitude) - longitude, 
                                        float.Parse(gpsData.GPSLatitude) - latitude);
        Debug.Log("X: " + pathDir.x.ToString() + "Y: " + pathDir.y.ToString());
    }
}