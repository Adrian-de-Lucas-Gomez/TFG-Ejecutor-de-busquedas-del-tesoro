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
    private TextMeshPro textMeshPro;
    

    [SerializeField] SpriteRenderer overlappingImagePrefab;
    [SerializeField] TextMeshPro textPrefab;

    private UnityEvent onFoundEvent = new UnityEvent();
    private UnityEvent onLostEvent = new UnityEvent();
    public override void Init(AdventureInfo data)
    {
        targetData = (ImageTargetInfo)data;

        if (targetData.overlappingImage != "")
            overlappingImage = Resources.Load<Sprite>("OverlappingImages/" + targetData.overlappingImage);
        else overlappingImage = null;

        //Las imagenes deben de estar almacenadas en la carpeta StreamingAssets/Vuforia
        pathToTarget = "Vuforia/" + targetData.nombreTarget;
       
        //En caso de que se haya creado otra fase de image target antes que esta, se habrá quedado sin borrar el
        //target anterior (y no se puede eliminar de otra forma porque hasta que no se desactiva por completo vuforia no
        //puedes eliminar el objeto trackeado), por eso antes de volver a activar vuforia otra vez, buscamos dicho
        //objeto y si existe lo eliminamos
        GameObject g  = GameObject.Find("ImageTarget");
        if (g != null) Destroy(g);

        VuforiaARController.Instance.RegisterVuforiaStartedCallback(CreateImageTargetFromSideloadedTexture);
    }

    private void CreateImageTargetFromSideloadedTexture()
    {
        Debug.Log("Llamada a callback");
        objectTracker = TrackerManager.Instance.GetTracker<ObjectTracker>();

        // Coger en tiempo de ejecución la imagen y cargarla
        RuntimeImageSource runtimeImageSource = objectTracker.RuntimeImageSource;
        runtimeImageSource.SetFile(VuforiaUnity.StorageType.STORAGE_APPRESOURCE, pathToTarget, 0.15f, "CartelVuforia");

        // Creamos un nuevo dataset y usamos la imagen para crear un objeto trackable
        dataset = objectTracker.CreateDataSet();
        DataSetTrackableBehaviour trackableBehaviour = dataset.CreateTrackable(runtimeImageSource, "ImageTarget");

        // Añadimos al objeto que acabamos de crear un DefaultTrackableEventHandler
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
        else
        {
            textMeshPro = Instantiate(textPrefab, trackableHandler.gameObject.transform);
            textMeshPro.text = targetData.text;
            textMeshPro.gameObject.SetActive(false);
        }

        // Activamos el dataset que acabamos de crear (y sobre el que hemos creado el nuevo target)
        objectTracker.ActivateDataSet(dataset);
        objectTracker.Start();
    }

    private void OnTargetFoundAction()
    {
        if (targetData.text != "") textMeshPro.gameObject.SetActive(true);
        else if (overlappingImage != null) sp.gameObject.SetActive(true);

        GameManager.GetInstance().StageCompleted();
    }

    private void OnTargetLostAction()
    {
        if (overlappingImage != null) sp.gameObject.SetActive(false);
        else if(targetData.text != "") textMeshPro.gameObject.SetActive(false);
    }

    private void StopTrackingTarget()
    {
        if (TrackerManager.Instance != null)
        {
            //Positional DeviceTracker
            PositionalDeviceTracker posTracker = TrackerManager.Instance.GetTracker<PositionalDeviceTracker>();
            if (posTracker != null) posTracker.Stop();

            //Object Tracker
            objectTracker = TrackerManager.Instance.GetTracker<ObjectTracker>();
            if (objectTracker != null)
            {
                objectTracker.Stop();

                if (dataset != null)
                {
                    objectTracker.DeactivateDataSet(dataset);
                    dataset.DestroyAllTrackables(true);
                    dataset = null;
                }

            }
        }
    }

    public override void OnStageEnd()
    {
        StopTrackingTarget();
    }

}
