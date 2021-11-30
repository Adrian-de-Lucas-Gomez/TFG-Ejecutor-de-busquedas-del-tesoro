using UnityEngine;
using System.Collections;
using System;
using Vuforia;
using System.Threading;
using ZXing;
using ZXing.QrCode;
using ZXing.Common;
using UnityEngine.SceneManagement;

public class QRscanner : MonoBehaviour
{
    private PIXEL_FORMAT m_PixelFormat = PIXEL_FORMAT.GRAYSCALE;
    private bool m_RegisteredFormat = false;

    private bool reading;
    private string QRMessage;


    Thread qrThread;
    private Color32[] c;
    private int W, H;
    Image QCARoutput;
    bool updC;


    void OnEnable()
    {
        VuforiaARController.Instance.RegisterTrackablesUpdatedCallback(OnTrackablesUpdated);

        bool isAutoFocus = CameraDevice.Instance.SetFocusMode(Vuforia.CameraDevice.FocusMode.FOCUS_MODE_CONTINUOUSAUTO);
        if (!isAutoFocus)
        {
            CameraDevice.Instance.SetFocusMode(CameraDevice.FocusMode.FOCUS_MODE_NORMAL);
        }

        qrThread = new Thread(DecodeQR);
        qrThread.Start();

    }

    void OnDisable()
    {
        qrThread.Abort();
        qrThread = null;
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

            updC = true;
        }
        else
        {
            reading = false;
            Debug.Log(m_PixelFormat + " image is not available yet");
        }
    }

    void Update()
    {
        if (reading)
        {
            if (QCARoutput != null)
            {
                if (updC)
                {
                    updC = false;
                    Invoke("ForceUpdateC", 1f);
                    if (QCARoutput == null)
                    {
                        return;
                    }
                    c = null;
                    c = ImageToColor32(QCARoutput);
                    if (W == 0 | H == 0)
                    {
                        W = QCARoutput.BufferWidth;
                        H = QCARoutput.BufferHeight;
                    }
                    QCARoutput = null;
                }
            }
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
    void DecodeQR()
    {
        var barcodeReader = new BarcodeReader();
        while (true)
        {

            if (reading && c != null)
            {
                try
                {
                    ZXing.Result result = barcodeReader.Decode(c, W, H);
                    c = null;
                    if (result != null)
                    {
                        QRMessage = result.Text;

                        Debug.Log(QRMessage);
                    }
                }
                catch (Exception e)
                {
                    Debug.Log(e.Message);   //Siempre da aviso de el tamaño mayor que uno
                }
            }

        }
    }
    void ForceUpdateC()
    {
        updC = true;
    }

}
   
