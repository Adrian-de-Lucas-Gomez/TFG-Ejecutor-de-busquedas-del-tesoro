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

    [Tooltip("Texto para mostrar la distancia al objetivo")]
    [SerializeField] TextMeshProUGUI PointsDistance;

    [SerializeField] Image point;
    [SerializeField] Animation anim;

    //public float dist = 150.0f;   //Para hacer debug sin necesisad de tener el GPS

    private GPSInfo gpsData;
    private float GPSLongitude;
    private float GPSLatitude;
    private float radius;

    private bool changeSceneRequest = false;

    private float timeToChangeScene = 5.0f;

    private void Update()
    {
        if (changeSceneRequest)
        {
            //Llevamos nosotros la cuenta del tiempo para evitar usar corrutinas
            timeToChangeScene -= Time.deltaTime;
        }
        else
        {
            CheckGPSLocalization(scanner.GetLatitude(), scanner.GetLongitude());
            if (Input.GetKeyDown(KeyCode.Space)) { changeSceneRequest = true; DestinationReached(); }   //Debug
        }   

        //Esta parte es meramente para debug
        if (timeToChangeScene <= 0.0f){ FinaliceStage(); }
    }


    public override void Init(AdventureInfo data)
    {
        StartCoroutine(scanner.InitGPSTracking());

        gpsData = (GPSInfo)data;
        GPSLongitude = gpsData.GPSLongitude;
        GPSLatitude = gpsData.GPSLatitude;

        radius = gpsData.TriggerRadious;

        description.text = gpsData.LocationDescription;

        timeToChangeScene = 5.0f;

        changeSceneRequest = false;
    }

    /// <summary>
    /// Aqui actualizamos la interfaz para mostrar al usuario que ha llegado al objetivo
    /// </summary>
    private void DestinationReached()
    {
        //Dejamos de actualizar las coordenadas GPS
        scanner.stopGPSTracking();

        //Iluminamos el tracker en verde para indicar completado
        point.color = new Color(0.0f , 0.8f, 0.0f, 1.0f);

        //Ponemos un mensaje de felicitación para el jugador
        PointsDistance.text = "¡Enhorabuena has logrado llegar al destino!";

        //Reseteamos la animación del anillo
        anim["Pulse"].time = 0.0f;
        anim["Pulse"].speed = 0.0f;
    }


    private void FinaliceStage()
    {
        GameManager.GetInstance().StageCompleted();
    }

    /// <summary>
    /// Aqui comprobaríamos si nuestra posicion es suficientemente cercana al objetivo 
    /// </summary>
    /// <param name="latitude"></param>
    /// <param name="longitude"></param>
    private void CheckGPSLocalization(float latitude, float longitude)
    {
        float dist = 1000.0f;   //Una distancia ficticia

        //Si ya está recibiendo coordenadas reales
        if (latitude != 0 && longitude != 0)
        {
            //Calculamos la distancia de nuestra posicion a la objetivo
            dist = distance(latitude, longitude, GPSLatitude, GPSLongitude);

            PointsDistance.text = dist.ToString() + " metros";
        }
        else
        {
            PointsDistance.text = "*Esperando coordenadas GPS*";
        }

        //Aplicamos un color al tracker segun la distancia al objetivo (Azul=frio=lejos  &  Rojo=calor=cerca)
        point.color = new Color(10/dist, 0.0f, dist/150, 1.0f);

        anim["Pulse"].speed = 30 / dist;    //A 30 ira a velocidad normal 1.0f (Mas cerca mas rápido y mas lejos mas lento)

        //Si el jugador esta a 5 metros o menos del objetivo suponemos que lo ha encontrado
        if (dist <= radius)
        {
            DestinationReached();
            changeSceneRequest = true;
        }
    }

    private float toRadian(float angleIn10thofaDegree)
    {
        return angleIn10thofaDegree * Mathf.PI / 180;
    }

    /// <summary>
    /// Metodo que calcula la distancia entre dos puntos definidos por latitud y logitud usando la formula de Haversine y devolviendo el resultado en metros
    /// </summary>
    /// <param name="lat1"></param>
    /// <param name="lon1"></param>
    /// <param name="lat2"></param>
    /// <param name="lon2"></param>
    /// <returns></returns>
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

    public override void OnStageEnd()
    {

    }
}