using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Vuforia;

public class ImageTargetStage : Stage
{
    ImageTargetInfo targetData;      //Datos referentes al target
    //public VuforiaBehaviour vuforiaBehaviour;

    public override void Init(AdventureInfo data)
    {
        targetData = (ImageTargetInfo)data;
        VuforiaConfiguration.Instance.Vuforia.LicenseKey = targetData.keyPackage;
        Debug.Log(VuforiaConfiguration.Instance.Vuforia.LicenseKey);
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
