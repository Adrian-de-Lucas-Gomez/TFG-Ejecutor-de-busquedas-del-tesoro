using TMPro;
using Vuforia;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;

public class ImageTargetStage : Stage
{
    ImageTargetInfo targetData;      //Datos referentes al target
    private string pathToTarget;

    private DefaultTrackableEventHandler trackableHandler;

    private ObjectTracker objectTracker;
    private DataSet dataset;

    [SerializeField] GameObject pannel;
    [SerializeField] TextMeshProUGUI textInfo;
    //[SerializeField] GameObject gO;

    private UnityEvent onFoundEvent;
    public override void Init(AdventureInfo data)
    {
        
        onFoundEvent = new UnityEvent();
        targetData = (ImageTargetInfo)data;

        //Texto a mostrar cuando se encuentre el target
        if (targetData.hasText)
        {
            textInfo.text = targetData.text;
        }
        pannel.SetActive(false);

        //Las imagenes deben de estar almacenadas en la carpeta StreamingAssets/Vuforia
        pathToTarget = "Vuforia/" + targetData.nombreTarget;

        VuforiaARController.Instance.RegisterVuforiaStartedCallback(CreateImageTargetFromSideloadedTexture);
    }

    private void CreateImageTargetFromSideloadedTexture()
    {
        objectTracker = TrackerManager.Instance.GetTracker<ObjectTracker>();

        // Coger en tiempo de ejecución la imagen y cargarla
        RuntimeImageSource runtimeImageSource = objectTracker.RuntimeImageSource;
        runtimeImageSource.SetFile(VuforiaUnity.StorageType.STORAGE_APPRESOURCE, pathToTarget, 0.15f, "CartelVuforia");

        // Creamos un nuevo dataset y usamos la imagen para crear un objeto trackable
        dataset = objectTracker.CreateDataSet();
        DataSetTrackableBehaviour trackableBehaviour = dataset.CreateTrackable(runtimeImageSource, "ImageTarget"/*gO.gameObject*/);

        // Añadimos al objeto que acabamos de crear un DefaultTrackableEventHandler
        trackableHandler = trackableBehaviour.gameObject.AddComponent<DefaultTrackableEventHandler>();
        trackableHandler.StatusFilter = DefaultTrackableEventHandler.TrackingStatusFilter.Tracked;

        onFoundEvent.AddListener(OnTargetFoundAction);
        trackableHandler.OnTargetFound = onFoundEvent;

        Debug.Log(trackableHandler);
        Debug.Log("Nombre del trackable handler: " + trackableHandler.gameObject.name);

        // Activamos el dataset que acabamos de crear (y sobre el que hemos creado el nuevo target)
        objectTracker.ActivateDataSet(dataset);
        objectTracker.Start();
    }

    private void OnTargetFoundAction()
    {
        if (targetData.hasText) pannel.SetActive(true);
        NextScene();
    }

    public void NextScene()
    {
        //Debug.Log("A");
        //objectTracker.Stop();
        //objectTracker.DeactivateDataSet(dataset);
        //Destroy(trackableHandler);
        VuforiaARController.Instance.UnregisterVuforiaStartedCallback(CreateImageTargetFromSideloadedTexture);
        GameManager.getInstance().StageCompleted();
        //Debug.Log("d");
        //TrackerManager.Instance.DeinitTracker<ObjectTracker>();

    }

}
