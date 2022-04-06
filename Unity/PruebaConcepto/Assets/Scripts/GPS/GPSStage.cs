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


    [SerializeField] TextMeshProUGUI description;

    [SerializeField] TextMeshProUGUI PointsDistance;

    [SerializeField] Image point;
    [SerializeField] Animation anim;

    private GPSInfo gpsData;
    private float GPSLongitude;
    private float GPSLatitude;
    private float radius;

    bool changeSceneRequest = false;

    private void Update()
    {
        if (changeSceneRequest || Input.GetMouseButtonDown(0) /*|| Input.touchCount > 0*/)
        {
            //Desactivamos todo el sistema GPS para pasar limpios a la siguiente escena
            scanner.stopGPSTracking();
            GameManager.getInstance().GoToNextPhase();
        }         

        CheckGPSLocalization(scanner.GetLongitude(), scanner.GetLatitude());
    }


    public override void Init(AdventureInfo data)
    {
        StartCoroutine(scanner.InitGPSTracking());

        gpsData = (GPSInfo)data;
        GPSLongitude = gpsData.GPSLongitude;
        GPSLatitude = gpsData.GPSLatitude;

        radius = gpsData.TriggerRadious;

        description.text = gpsData.LocationDescription;

        changeSceneRequest = false;
    }

    private void CheckGPSLocalization(float longitude, float latitude)
    {
        //Aqui comprobaríamos si nuestra posicion es suficientemente cercana al objetivo

        float dist = distance(latitude, longitude, GPSLatitude, GPSLongitude);
        PointsDistance.text = dist.ToString() + " metros";

        point.color = new Color(255 / dist, 0.0f, dist / 255, 1.0f);

        if (dist > 100)
        {
            anim["Pulse"].speed = 0.3f;
        }
        else
        {
            anim["Pulse"].speed = 30 / dist;
            
        }

        //Si el jugador esta a 5 metros o menos del objetivo suponemos que lo ha encontrado
        if (dist <= radius)
        {
            //Preparamos para salir de la escena
            changeSceneRequest = true;
        }
    }

    private float toRadian(float angleIn10thofaDegree)
    {
        return angleIn10thofaDegree * Mathf.PI / 180;
    }
    float distance(float lat1, float lon1, float lat2, float lon2)
    {
        float dlat = toRadian(lat2-lat1);
        float dlon = toRadian(lon2- lon1);

        // Haversine formula
        float haversine = Mathf.Pow(Mathf.Sin(dlat / 2), 2) +
                   Mathf.Cos(toRadian(lat1)) * Mathf.Cos(toRadian(lat2)) *
                   Mathf.Pow(Mathf.Sin(dlon / 2), 2);

        float realDistance = 2 * Mathf.Asin(Mathf.Sqrt(haversine)) * 6371 * 1000;  //Lo queremos en metros no en kilometros

        return realDistance;  
    }
}