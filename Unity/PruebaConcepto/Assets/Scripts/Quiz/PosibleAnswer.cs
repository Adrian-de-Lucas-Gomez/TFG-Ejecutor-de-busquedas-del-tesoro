
using Newtonsoft.Json.Linq;

//Esta clase representa los datos que forman una de las posibles respuestas dentro de un quiz
[System.Serializable]
public class PosibleAnswer
{
    public string text;                         //Texto de la respuesta
    public bool isCorrect;                      //Indica si la respuesta es verdadera o falsa


    /// <summary>
    /// MEtodo que recibe informacion de un JSON y saca la informacion de dentro de este para formar una posible respuesta de quiz
    /// </summary>
    /// <param name="myInfo">Bloque de informacion que corresponde a una respuesta</param>
    public void readFromJSON(JObject myInfo)
    {
        text = myInfo["text"].Value<string>();
        isCorrect = myInfo["isCorrect"].Value<bool>();
    }
}
