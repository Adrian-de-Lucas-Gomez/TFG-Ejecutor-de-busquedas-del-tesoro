using Newtonsoft.Json.Linq;
using UnityEngine;
public class ImageTargetInfo : AdventureInfo
{
    public string nombreTarget;
    #region TO_ERASE
    public string nombrePackage;
    public string keyPackage;
    #endregion
    public bool hasText;
    public bool showImage;
    public string text = "";

    /// <summary>
    /// Metodo que recibe un objeto parseado de JSON y saca toda la informacion que necesite de este
    /// </summary>
    /// <param name="myInfo"> Objeto que salio de un JSON que contiene nuestra info </param>
    public void readFromJSON(JObject myInfo)
    {
        //Me quedo con la escena a la que me tengo que ir para ejecutarme
        stage = myInfo["tipo"].Value<string>();

        //Obtengo los datos del imageTarget
        #region T0_ERASE
        string aux = myInfo["Package"].Value<string>();
        string[] splitArray = aux.Split('.');
        nombrePackage = splitArray[0];
        keyPackage = myInfo["Key"].Value<string>();
        #endregion //Version antigua ImageTarget

        nombreTarget = myInfo["Target"].Value<string>();
        hasText = myInfo["AddText"].Value<bool>();
        showImage = myInfo["ShowImage"].Value<bool>();

        if (hasText)
        {
            text = myInfo["Text"].Value<string>();
        }

    }
}
