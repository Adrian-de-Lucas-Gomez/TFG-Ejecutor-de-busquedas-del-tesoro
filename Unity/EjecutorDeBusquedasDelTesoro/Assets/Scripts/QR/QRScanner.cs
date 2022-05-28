using UnityEngine;
using System.Collections;
using System;
using Vuforia;
using System.Threading;
using ZXing;
using ZXing.QrCode;
using ZXing.Common;
using UnityEngine.SceneManagement;

public class QRScanner : MonoBehaviour
{
    private PIXEL_FORMAT m_PixelFormat = PIXEL_FORMAT.GRAYSCALE;
    private bool m_RegisteredFormat = false;

    private bool reading;

    private Color32[] c;
    private int W, H;
    Image QCARoutput;

    [SerializeField] float timeToScan = 1.0f;
    private float timeElapsed = 0.0f;

    private string QRvalueRead = "";
    private bool isValueRead = false;
    private BarcodeReader barcodeReader;

    void Start()
    {
        VuforiaARController.Instance.RegisterTrackablesUpdatedCallback(OnTrackablesUpdated);

        bool isAutoFocus = CameraDevice.Instance.SetFocusMode(Vuforia.CameraDevice.FocusMode.FOCUS_MODE_CONTINUOUSAUTO);
        if (!isAutoFocus)
        {
            CameraDevice.Instance.SetFocusMode(CameraDevice.FocusMode.FOCUS_MODE_NORMAL);
        }

        barcodeReader = new BarcodeReader();

    }

    public void OnTrackablesUpdated()
    {
        Vuforia.CameraDevice cam = Vuforia.CameraDevice.Instance;

        if (!m_RegisteredFormat)
        {
            Vuforia.CameraDevice.Instance.SetFrameFormat(m_PixelFormat, true);

            m_RegisteredFormat = true;
        }
        QCARoutput = cam.GetCameraImage(m_PixelFormat);
        if (QCARoutput != null)
        {
            reading = true;
        }
        else
        {
            reading = false;
            Debug.Log(m_PixelFormat + " image is not available yet");
        }
    }

    void Update()
    {
        //Actualizamos el contador
        timeElapsed += Time.deltaTime;

        //Si está activado el escaner, recibe señal de la cámara y es hora de escanear de nuevo accedemos
        if (reading && QCARoutput != null && timeElapsed >= timeToScan)
        {
            timeElapsed = 0.0f;
                    
            if (QCARoutput == null)
            {
                return;
            }
            c = null;   
            c = ImageToColor32(QCARoutput);

            if (W == 0 | H == 0){ W = QCARoutput.BufferWidth; H = QCARoutput.BufferHeight; }
                    
            try
            {
                ZXing.Result result = barcodeReader.Decode(c, W, H);
                c = null;
                if (result != null)
                {
                    isValueRead = true;
                    QRvalueRead = result.Text;
                }
                else
                {
                    isValueRead = false;
                }
            }
            catch (Exception e)
            {
                Debug.Log(e.Message);   //Siempre da aviso de el tamaño mayor que uno
            }

            QCARoutput = null;
        }
    }

    Color32[] ImageToColor32(Vuforia.Image a)
    {
        if (a == null) { return null; }
        Color32[] r = new Color32[a.BufferWidth * a.BufferHeight];
        for (int i = 0; i < r.Length; i++)
        {
            r[i].r = r[i].g = r[i].b = a.Pixels[i];
        }

        return r;
    }

    public void EnableScanning(bool active)
    {
        reading = active;
    }

    public string GetValueRead()
    {
        return QRvalueRead;
    }

    public bool GetIsValueRead()
    {
        return isValueRead;
    }
}
   
