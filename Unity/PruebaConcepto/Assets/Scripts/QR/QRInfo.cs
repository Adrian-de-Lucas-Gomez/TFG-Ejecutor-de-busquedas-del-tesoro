using Newtonsoft.Json.Linq;
using System.Collections.Generic;

//Esta clase representa los datos con los que va a trabajar una fase de tipo QR
[System.Serializable]
public class QRInfo : AdventureInfo
{

    public string QRValue = "";

    /// <summary>
    /// Metodo que recibe un objeto parseado de JSON y saca toda la informacion que necesite de este
    /// </summary>
    /// <param name="myInfo"> Objeto que salio de un JSON que contiene nuestra info </param>
    public void readFromJSON(JObject myInfo)
    {
        //Me quedo con la escena a la que me tengo que ir para ejecutarme
        stage = myInfo["tipo"].Value<string>();

        //Obtengo los datos del qr
        QRValue = myInfo["QRText"].Value<string>();
    }
}
