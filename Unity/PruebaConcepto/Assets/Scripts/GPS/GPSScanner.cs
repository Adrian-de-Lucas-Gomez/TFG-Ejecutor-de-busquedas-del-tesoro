using UnityEngine;
using System.Collections;

public class GPSScanner : MonoBehaviour
{
    private float ActualLongitude;
    private float ActualLatitude;
    private void UpdateCoordinates()
    {
        //Actualizamos los valores de latitud y longitud que ha registrado el GPS
        ActualLongitude = Input.location.lastData.longitude;
        ActualLatitude = Input.location.lastData.latitude;
    }

    public IEnumerator InitGPSTracking()
    {
        // First, check if user has location service enabled
        if (!UnityEngine.Input.location.isEnabledByUser)
        {
            // TODO Failure
            Debug.LogFormat("Android and Location not enabled");
            yield break;
        }

        //Arrancamos el sistema de localizacion de Unity con precision de un metro
        Input.location.Start(1f, 1f);

        //Como el arranque no es instantaneo damos un margen para que se inicialize
        int maxWait = 20;
        while (Input.location.status == LocationServiceStatus.Initializing && maxWait > 0)
        {
            yield return new WaitForSeconds(1);
            maxWait--;
            Debug.Log(maxWait.ToString());
        }

        //Si se consumieron los 20 segundos y no se inicializo lo damos por fallido
        if (maxWait < 1) { print("Timed out"); yield break; }

        //Si no es capaz de corroborar la posicion es que ha fallado
        if (Input.location.status == LocationServiceStatus.Failed) { print("Unable to determine device location"); yield break; }

        //Si está funcionando correctamente podemos comenzar a pedir actulizaciones periódicas de la posicion
        else   InvokeRepeating("UpdateCoordinates", 1.0f, 1.0f);
    }

    public void stopGPSTracking()
    {
        //Desactivamos la actualizacion periodica y paramos el sistema de localizacion
        CancelInvoke("UpdateCoordinates");
        Input.location.Stop();
    }

    public float GetLatitude()
    {
        return ActualLatitude;
    }

    public float GetLongitude()
    {
        return ActualLongitude;
    }

}

