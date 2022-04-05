using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;
using System.Globalization;

public class GPSStage : Stage
{
    [Tooltip("Lector de coordenadas GPS")]
    [SerializeField] GPSScanner scanner;


    [SerializeField] TextMeshProUGUI UILongitude;
    [SerializeField] TextMeshProUGUI UILatitude;

    [SerializeField] TextMeshProUGUI UILongitudeObj;
    [SerializeField] TextMeshProUGUI UILatitudeObj;

    [SerializeField] TextMeshProUGUI PointsDistance;

    //[SerializeField] RectTransform arrow;

    GPSInfo gpsData;
    float GPSLongitude;
    float GPSLatitude;

    bool changeSceneRequest = false;

    private void Update()
    {
        if (changeSceneRequest /*|| Input.GetMouseButtonDown(0) || Input.touchCount > 0*/)
            GameManager.getInstance().GoToNextPhase();

        //CalculatePathDirection(scanner.GetLongitude(), scanner.GetLatitude());

        CheckGPSLocalization(scanner.GetLongitude(), scanner.GetLatitude());

        //arrow.Rotate(new Vector3(0, 0, 1), (Mathf.PI / 2));
    }


    public override void Init(AdventureInfo data)
    {
        StartCoroutine(scanner.InitGPSTracking());

        gpsData = (GPSInfo)data;
        GPSLongitude = float.Parse(gpsData.GPSLongitude, CultureInfo.InvariantCulture.NumberFormat);
        GPSLatitude = float.Parse(gpsData.GPSLatitude, CultureInfo.InvariantCulture.NumberFormat);

        UILongitudeObj.text = GPSLongitude.ToString();
        UILatitudeObj.text = GPSLatitude.ToString();

        changeSceneRequest = false;
    }

    private void CheckGPSLocalization(float longitude, float latitude)
    {
        UILongitude.text = longitude.ToString();
        UILatitude.text = latitude.ToString();

        //Aqui comprobaríamos si nuestra posicion es suficientemente cercana al objetivo
        //Debug.Log(distance(lat1, lat2, lon1, lon2) + " K.M");
        float dist = distance(latitude, longitude, GPSLatitude, GPSLongitude);
        PointsDistance.text = dist.ToString() + " metros";

        if (dist <= 5)
        {
            scanner.stopGPSTracking();
            changeSceneRequest = true;
        }
    }
    
    private void CalculatePathDirection(float longitude, float latitude)
    {
        //float auxLongitude = float.Parse(gpsData.GPSLongitude, CultureInfo.InvariantCulture.NumberFormat);
        //float auxLatitude = float.Parse(gpsData.GPSLatitude, CultureInfo.InvariantCulture.NumberFormat);

        //Debug.Log("N: " + auxLatitude.ToString() + " W: " + auxLongitude.ToString());

        //Vector2 pathDir = new Vector2(auxLongitude - longitude, auxLatitude - latitude);
        //Debug.Log("X: " + pathDir.x.ToString() + " Y: " + pathDir.y.ToString());
    }

    private float toRadian(float angleIn10thofaDegree)
    {
        return angleIn10thofaDegree * Mathf.PI / 180;
    }
    float distance(float lat1, float lon1, float lat2, float lon2)
    {
        // The math module contains
        // a function named toRadians
        // which converts from degrees
        // to radians.

        float dlat = toRadian(lat2-lat1);
        float dlon = toRadian(lon2- lon1);

        // Haversine formula
        float a = Mathf.Pow(Mathf.Sin(dlat / 2), 2) +
                   Mathf.Cos(toRadian(lat1)) * Mathf.Cos(toRadian(lat2)) *
                   Mathf.Pow(Mathf.Sin(dlon / 2), 2);

        float realDistance = 2 * Mathf.Asin(Mathf.Sqrt(a)) * 6371 * 1000;  //Lo queremos en metros no en KM

        return realDistance;  
    }
}