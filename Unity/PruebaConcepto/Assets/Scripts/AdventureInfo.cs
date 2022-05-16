using Newtonsoft.Json.Linq;
using System.Collections.Generic;


/// <summary>
/// Padre de todos los bloques de informacion de cada fase
/// </summary>
[System.Serializable]
public class AdventureInfo
{
    //Nombre de la escena a la que nos debemos de ir para ejecutar esta fase
    public string stage = "";
    public string hint = "";

    public virtual void ReadFromJSON(JObject myInfo) { }
}
