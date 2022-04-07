using Newtonsoft.Json.Linq;
using System.Collections.Generic;

public class InputTextInfo : AdventureInfo
{
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
        codigo = myInfo["Codigo"].Value<string>();
    }
}