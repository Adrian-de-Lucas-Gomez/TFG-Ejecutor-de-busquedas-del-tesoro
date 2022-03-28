using TMPro;
using Vuforia;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;

public class ImageTargetStage : Stage
{
    ImageTargetInfo targetData;      //Datos referentes al target
    private string pathToTarget;

    DefaultTrackableEventHandler trackableHandler;
    
    [SerializeField] Button nextButton;
    [SerializeField] GameObject pannel;
    [SerializeField] TextMeshProUGUI textInfo;
    [SerializeField] UnityEngine.UI.Image image;

    private UnityEvent onFoundEvent;
    public override void Init(AdventureInfo data)
    {
        onFoundEvent = new UnityEvent();
        targetData = (ImageTargetInfo)data;

        //Boton para pasar a la siguiente fase
        nextButton.gameObject.SetActive(false);
        nextButton.onClick.AddListener(GameManager.getInstance().GoToNextPhase);

        //Texto a mostrar cuando se encuentre el target
        if (targetData.hasText)
        {
            textInfo.text = targetData.text;
        }
        pannel.SetActive(false);

        if (targetData.showImage)
        {
            //TO DO: Habría que coger la textura de streamming assets y usarla 
        }
        image.gameObject.SetActive(false);

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
        trackableHandler = trackableBehaviour.gameObject.AddComponent<DefaultTrackableEventHandler>();
        trackableHandler.StatusFilter = DefaultTrackableEventHandler.TrackingStatusFilter.Tracked;

        onFoundEvent.AddListener(OnTargetFoundAction);
        trackableHandler.OnTargetFound = onFoundEvent;

        Debug.Log(trackableHandler);
        Debug.Log("Nombre del trackable handler: " + trackableHandler.gameObject.name);

        // Activamos el dataset que acabamos de crear (y sobre el que hemos creado el nuevo target)
        objectTracker.ActivateDataSet(dataset);
    }

    private void OnTargetFoundAction()
    {
        if (targetData.hasText) pannel.SetActive(true);
        if (targetData.showImage) image.gameObject.SetActive(true);
        nextButton.gameObject.SetActive(true);
    }

}
