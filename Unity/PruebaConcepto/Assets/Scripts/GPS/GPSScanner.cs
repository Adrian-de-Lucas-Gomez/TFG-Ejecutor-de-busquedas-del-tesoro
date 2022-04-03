using UnityEngine;
using System.Collections;

public class GPSScanner : MonoBehaviour
{
    private float ActualLongitude;
    private float ActualLatitude;

    public IEnumerator InitGPSTracking()
    {
#if UNITY_EDITOR
        // No permission handling needed in Editor
#elif UNITY_ANDROID
        if (!UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.CoarseLocation)) {
            UnityEngine.Android.Permission.RequestUserPermission(UnityEngine.Android.Permission.CoarseLocation);
        }

        // First, check if user has location service enabled
        if (!UnityEngine.Input.location.isEnabledByUser) {
            // TODO Failure
            Debug.LogFormat("Android and Location not enabled");
            yield break;
        }
#endif

        // Starts the location service.
        Input.location.Start(500f, 500f);

        // Waits until the location service initializes
        int maxWait = 20;
        while (Input.location.status == LocationServiceStatus.Initializing && maxWait > 0)
        {
            yield return new WaitForSeconds(1);
            maxWait--;
            Debug.Log(maxWait.ToString());
        }

        // If the service didn't initialize in 20 seconds this cancels location service use.
        if (maxWait < 1)
        {
            print("Timed out");
            yield break;
        }

        // If the connection failed this cancels location service use.
        if (Input.location.status == LocationServiceStatus.Failed)
        {
            print("Unable to determine device location");
            yield break;
        }
        else
        {
            Debug.Log(Input.location.status);

            // If the connection succeeded, this retrieves the device's current location and displays it in the Console window.
            //print("Location: " + Input.location.lastData.latitude + " " + Input.location.lastData.longitude + " " + Input.location.lastData.altitude + " " + Input.location.lastData.horizontalAccuracy + " " + Input.location.lastData.timestamp);           
            InvokeRepeating("UpdateCoordinates", 0.0f, 2.0f);
        }

        
    }

    public void stopGPSTracking()
    {
        CancelInvoke("UpdateCoordinates");
        // Stops the location service if there is no need to query location updates continuously.
        Input.location.Stop();
    }
    void UpdateCoordinates()
    {
        ActualLongitude = Input.location.lastData.longitude;
        ActualLatitude = Input.location.lastData.latitude;
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

