using Newtonsoft.Json.Linq;
public class ImageTargetInfo : AdventureInfo
{
    public string nombreTarget;
    public bool hasText;
    public string text;
    //public bool showImage;

    /// <summary>
    /// Metodo que recibe un objeto parseado de JSON y saca toda la informacion que necesite de este
    /// </summary>
    /// <param name="myInfo"> Objeto que salio de un JSON que contiene nuestra info </param>
    public void readFromJSON(JObject myInfo)
    {
        //Me quedo con la escena a la que me tengo que ir para ejecutarme
        stage = myInfo["tipo"].Value<string>();

        //Obtengo los datos del target
        nombreTarget = myInfo["Target"].Value<string>();
        hasText = myInfo["AddText"].Value<bool>();
        text = myInfo["Text"].Value<string>();
        //showImage = myInfo["ShowImage"].Value<bool>();
       
    }
}
