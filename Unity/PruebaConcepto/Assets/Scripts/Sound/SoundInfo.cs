using Newtonsoft.Json.Linq;
using System.Collections.Generic;

public class SoundInfo : AdventureInfo
{
    public string nombreSonido;
    public string codigo;

    /// <summary>
    /// Metodo que recibe un objeto parseado de JSON y saca toda la informacion que necesite de este
    /// </summary>
    /// <param name="myInfo"> Objeto que salio de un JSON que contiene nuestra info </param>
    public void readFromJSON(JObject myInfo)
    {
        //Me quedo con la escena a la que me tengo que ir para ejecutarme
        stage = myInfo["tipo"].Value<string>();

        //Obtengo los datos 
        string aux = myInfo["Sonido"].Value<string>();
        string[] splitArray = aux.Split('.');
        nombreSonido = splitArray[0];
    }
}