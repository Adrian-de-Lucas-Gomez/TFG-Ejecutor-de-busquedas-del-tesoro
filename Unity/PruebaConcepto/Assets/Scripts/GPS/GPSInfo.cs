using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Globalization;

//Esta clase representa los datos con los que va a trabajar una fase de tipo GPS
[System.Serializable]
public class GPSInfo : AdventureInfo
{
    public float GPSLatitude;
    public float GPSLongitude;
    public float TriggerRadious;
    public string LocationDescription;

    /// <summary>
    /// Metodo que recibe un objeto parseado de JSON y saca toda la informacion que necesite de este
    /// </summary>
    /// <param name="myInfo"> Objeto que salio de un JSON que contiene nuestra info </param>
    public void readFromJSON(JObject myInfo)
    {
        //Me quedo con la escena a la que me tengo que ir para ejecutarme
        stage = myInfo["tipo"].Value<string>();

        //Obtengo los datos de coordenadas
        GPSLatitude = float.Parse(myInfo["GPSLatitude"].Value<string>(), CultureInfo.InvariantCulture.NumberFormat);

        GPSLongitude = float.Parse(myInfo["GPSLongitude"].Value<string>(), CultureInfo.InvariantCulture.NumberFormat);

        //Obtengo el radio de accion del destino en metros
        TriggerRadious = float.Parse(myInfo["radius"].Value<string>(), CultureInfo.InvariantCulture.NumberFormat);
        
        //Obtengo la descripcion del lugar al que quiero llegar
        LocationDescription = myInfo["description"].Value<string>();
    }
}