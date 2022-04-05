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
        // Angle in 10th
        // of a degree
        return (angleIn10thofaDegree *
                       Mathf.PI) / 180;
    }
    float distance(float lat1, float lat2, float lon1, float lon2)
    {
        // The math module contains
        // a function named toRadians
        // which converts from degrees
        // to radians.
        lat1 = toRadian(lat1);
        lon1 = toRadian(lon1);

        lat2 = toRadian(lat2);
        lon2 = toRadian(lon2);

        // Haversine formula
        float dlon = lon2 - lon1;
        float dlat = lat2 - lat1;
        float a = Mathf.Pow(Mathf.Sin(dlat / 2), 2) +
                   Mathf.Cos(lat1) * Mathf.Cos(lat2) *
                   Mathf.Pow(Mathf.Sin(dlon / 2), 2);

        float c = 2 * Mathf.Asin(Mathf.Sqrt(a));

        // calculate the result
        return c * 6371 * 1000;  //Lo queremos en metros no en KM
    }
}