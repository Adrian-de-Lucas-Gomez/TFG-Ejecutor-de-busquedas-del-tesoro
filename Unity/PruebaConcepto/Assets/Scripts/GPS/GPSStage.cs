using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;
using System.Globalization;

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
        StartCoroutine(scanner.InitGPSTracking());

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

        //Aqui comprobaríamos si nuestra posicion es suficientemente cercana al objetivo
        //scanner.stopGPSTracking();
    }

    private void CalculatePathDirection(float longitude, float latitude)
    {
        float auxLongitude = float.Parse(gpsData.GPSLongitude, CultureInfo.InvariantCulture.NumberFormat);
        float auxLatitude = float.Parse(gpsData.GPSLatitude, CultureInfo.InvariantCulture.NumberFormat);

        //Debug.Log("N: " + auxLatitude.ToString() + " W: " + auxLongitude.ToString());

        Vector2 pathDir = new Vector2(auxLongitude - longitude, auxLatitude - latitude);
        //Debug.Log("X: " + pathDir.x.ToString() + " Y: " + pathDir.y.ToString());
    }
}