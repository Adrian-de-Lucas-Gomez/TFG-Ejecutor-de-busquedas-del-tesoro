using TMPro;
using Vuforia;
using UnityEngine;
using UnityEngine.Events;

public class ImageTargetStage : Stage
{
    ImageTargetInfo targetData;      //Datos referentes al target
    private string pathToTarget;

    private DefaultTrackableEventHandler trackableHandler;

    private ObjectTracker objectTracker;
    private DataSet dataset;
    private Sprite overlappingImage = null;
    private SpriteRenderer sp;

    [SerializeField] GameObject pannel;
    [SerializeField] TextMeshProUGUI textInfo;
    [SerializeField] SpriteRenderer overlappingImagePrefab;

    private UnityEvent onFoundEvent = new UnityEvent();
    private UnityEvent onLostEvent = new UnityEvent();
    public override void Init(AdventureInfo data)
    {
        targetData = (ImageTargetInfo)data;

        //Texto a mostrar cuando se encuentre el target
        if (targetData.text != "")
        {
            textInfo.text = targetData.text;
        }
        pannel.SetActive(false);

        if (targetData.overlappingImage != "")
            overlappingImage = Resources.Load<Sprite>("OverlappingImages/" + targetData.overlappingImage);
        else overlappingImage = null;

        //Las imagenes deben de estar almacenadas en la carpeta StreamingAssets/Vuforia
        pathToTarget = "Vuforia/" + targetData.nombreTarget;

        VuforiaARController.Instance.RegisterVuforiaStartedCallback(CreateImageTargetFromSideloadedTexture);
    }

    private void CreateImageTargetFromSideloadedTexture()
    {
        Debug.Log("Llamada a callback");
        objectTracker = TrackerManager.Instance.GetTracker<ObjectTracker>();

        // Coger en tiempo de ejecuci�n la imagen y cargarla
        RuntimeImageSource runtimeImageSource = objectTracker.RuntimeImageSource;
        runtimeImageSource.SetFile(VuforiaUnity.StorageType.STORAGE_APPRESOURCE, pathToTarget, 0.15f, "CartelVuforia");

        // Creamos un nuevo dataset y usamos la imagen para crear un objeto trackable
        dataset = objectTracker.CreateDataSet();
        DataSetTrackableBehaviour trackableBehaviour = dataset.CreateTrackable(runtimeImageSource, "ImageTarget");

        // A�adimos al objeto que acabamos de crear un DefaultTrackableEventHandler
        trackableHandler = trackableBehaviour.gameObject.AddComponent<DefaultTrackableEventHandler>();
        trackableHandler.StatusFilter = DefaultTrackableEventHandler.TrackingStatusFilter.Tracked;

        onFoundEvent.AddListener(OnTargetFoundAction);
        onLostEvent.AddListener(OnTargetLostAction);
        
        trackableHandler.OnTargetFound = onFoundEvent;
        trackableHandler.OnTargetLost = onLostEvent;

        Debug.Log(trackableHandler);
        Debug.Log("Nombre del trackable handler: " + trackableHandler.gameObject.name);

        if (overlappingImage != null)
        {
            sp = Instantiate(overlappingImagePrefab, trackableHandler.gameObject.transform);
            sp.sprite = overlappingImage;
            sp.gameObject.SetActive(false);
        }

        // Activamos el dataset que acabamos de crear (y sobre el que hemos creado el nuevo target)
        objectTracker.ActivateDataSet(dataset);
        objectTracker.Start();
    }

    private void OnTargetFoundAction()
    {
        if (targetData.text != "") pannel.SetActive(true);
        else if (overlappingImage != null) sp.gameObject.SetActive(true);
        NextScene();
    }

    private void OnTargetLostAction()
    {
        if (overlappingImage != null) sp.gameObject.SetActive(false);
    }

    public void NextScene()
    {
        //Debug.Log("A");
        //objectTracker.Stop();
        //objectTracker.DeactivateDataSet(dataset);
        //Destroy(trackableHandler);
        //VuforiaARController.Instance.UnregisterVuforiaStartedCallback(CreateImageTargetFromSideloadedTexture);
       
        GameManager.getInstance().StageCompleted();

        //Debug.Log("d");
        //TrackerManager.Instance.DeinitTracker<ObjectTracker>();

        //TO DO: esto habr�a que hacerlo cuando se pulsa el boton de siguiente
        //if (TrackerManager.Instance.GetTracker<ObjectTracker>() != null)
        //    TrackerManager.Instance.GetTracker<ObjectTracker>().Stop();
        //Destroy(trackableHandler.gameObject);

    }

}
