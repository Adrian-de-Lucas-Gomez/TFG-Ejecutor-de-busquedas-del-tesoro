using Newtonsoft.Json.Linq;
public class ImageTargetInfo : AdventureInfo
{
    public enum TargetType
    {
        OVERLAP_IMAGE, OVERLAP_TEXT, DEAFULT
    }

    public string nombreTarget;
    public TargetType targetType = TargetType.DEAFULT;

    public string text = "";
    public string overlappingImage = "";

    /// <summary>
    /// Metodo que recibe un objeto parseado de JSON y saca toda la informacion que necesite de este
    /// </summary>
    /// <param name="myInfo"> Objeto que salio de un JSON que contiene nuestra info </param>
    public override void ReadFromJSON(JObject myInfo)
    {
        //Me quedo con la escena a la que me tengo que ir para ejecutarme
        stage = myInfo["tipo"].Value<string>();

        //Ponemos la pista al valor que nos de el JSON y en caso de que sea un valor vacio le ponemos un valor por defecto nosotros
        string value = myInfo["Pista"].Value<string>();
        if (value == "") hint = "Sin pista";
        else hint = value;

        //Obtengo los datos del target
        nombreTarget = myInfo["Target"].Value<string>();
        string type = myInfo["TargetType"].Value<string>();

        if (type == "Image")
        {
            targetType = TargetType.OVERLAP_IMAGE;

            string aux = myInfo["OverlappingImage"].Value<string>();
            string[] splitArray = aux.Split('.');
            overlappingImage = splitArray[0];
        }
        else if (type == "Text")
        {
            targetType = TargetType.OVERLAP_TEXT;
            text = myInfo["Text"].Value<string>();
        }
       
    }
}
