using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Vuforia;

public class ImageTargetStage : Stage
{
    ImageTargetInfo targetData;      //Datos referentes al target

    public override void Init(AdventureInfo data)
    {
        targetData = (ImageTargetInfo)data;
        VuforiaConfiguration.Instance.Vuforia.LicenseKey = targetData.keyPackage;

        //if (DataSet.Exists(targetData.nombrePackage))
        //    Debug.Log("Existo!!");
        //else
        //    Debug.LogError("No esta instalado el database proporcionado");


        //ObjectTracker objectTracker = TrackerManager.Instance.InitTracker<ObjectTracker>();
        //objectTracker.Start();



        //IEnumerable<DataSet> datasets = objectTracker.GetDataSets();
        // Request an ImageTracker instance from the TrackerManager.
        //ObjectTracker objectTracker = TrackerManager.Instance.GetTracker<ObjectTracker>();
        //Debug.Log(datasets.ToList().Count);


        // Create a new empty data set.
        //DataSet dataSet = objectTracker.CreateDataSet();

        //Debug.Log(targetData.nombrePackage);
        //if (dataSet.Load(targetData.nombrePackage))
        //{
        //    Debug.Log("El dataset se ha cargado correctamente");
        //    objectTracker.ActivateDataSet(dataSet);
        //}
        //else Debug.Log("Derrota");

        /*
        var objectTracker = TrackerManager.Instance.GetTracker<ObjectTracker>();

        // get the runtime image source and set the texture to load
        var runtimeImageSource = objectTracker.RuntimeImageSource;
        runtimeImageSource.SetFile(VuforiaUnity.StorageType.STORAGE_APPRESOURCE, "Vuforia/myTarget.jpg", 0.15f, "myTargetName");

        // create a new dataset and use the source to create a new trackable
        var dataset = objectTracker.CreateDataSet();
        var trackableBehaviour = dataset.CreateTrackable(runtimeImageSource, targetData.nombreTarget);

        // add the DefaultTrackableEventHandler to the newly created game object
        trackableBehaviour.gameObject.AddComponent<DefaultTrackableEventHandler>();

        // activate the dataset
        objectTracker.ActivateDataSet(dataset);

        // TODO: add virtual content as child object(s)
        */
    }

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
