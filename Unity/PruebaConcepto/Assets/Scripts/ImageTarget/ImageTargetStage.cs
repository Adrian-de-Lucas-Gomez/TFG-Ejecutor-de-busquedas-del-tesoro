using UnityEngine;
using Vuforia;

public class ImageTargetStage : Stage
{
    ImageTargetInfo targetData;      //Datos referentes al target
    private string pathToTarget;
    public override void Init(AdventureInfo data)
    {
        targetData = (ImageTargetInfo)data;
        /*
         * Las imagenes deben de estar almacenadas en la carpeta StreamingAssets/Vuforia, 
         * TO DO: quitar el _scaled.jpg, ahora mismo es necesario porque la imagen que estamos usando
         * por defecto es de un database de vuforia (que no está cargado) que le anade
         * esa coletilla _scaled por defecto
         */
        pathToTarget = "Vuforia/" + targetData.nombreTarget + "_scaled.jpg";
        VuforiaARController.Instance.RegisterVuforiaStartedCallback(CreateImageTargetFromSideloadedTexture);
    }

    private void CreateImageTargetFromSideloadedTexture()
    {
        ObjectTracker objectTracker = TrackerManager.Instance.GetTracker<ObjectTracker>();

        // Coger en tiempo de ejecución la imagen y cargarla
        RuntimeImageSource runtimeImageSource = objectTracker.RuntimeImageSource;
        runtimeImageSource.SetFile(VuforiaUnity.StorageType.STORAGE_APPRESOURCE, pathToTarget, 0.15f, "CartelVuforia");

        // Creamos un nuevo dataset y usamos la imagen para crear un objeto trackable
        DataSet dataset = objectTracker.CreateDataSet();
        DataSetTrackableBehaviour trackableBehaviour = dataset.CreateTrackable(runtimeImageSource, "ImageTarget");

        // Añadimos al objeto que acabamos de crear un DefaultTrackableEventHandler
        DefaultTrackableEventHandler behaviour = trackableBehaviour.gameObject.AddComponent<DefaultTrackableEventHandler>();
        behaviour.StatusFilter = DefaultTrackableEventHandler.TrackingStatusFilter.Tracked;

        // Activamos el dataset que acabamos de crear (y sobre el que hemos creado el nuevo target)
        objectTracker.ActivateDataSet(dataset);

        //TO ERASE: para comprobar que detecta el target que hemos creado
        GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cube.transform.SetParent(trackableBehaviour.transform);
        cube.transform.localScale = new Vector3(0.1f, 0.1f, 0.1f);

    }

}
