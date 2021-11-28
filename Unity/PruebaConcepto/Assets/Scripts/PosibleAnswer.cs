
//Esta clase representa los datos que forman una de las posibles respuestas dentro de un quiz
using Newtonsoft.Json.Linq;

[System.Serializable]
public class PosibleAnswer
{
    public string text;                         //Texto de la respuesta
    public bool isCorrect;                      //Indica si la respuesta es verdadera o falsa

    public void readFromJSON(JObject myInfo)
    {
        text = myInfo["text"].Value<string>();
        isCorrect = myInfo["isCorrect"].Value<bool>();
    }
}
