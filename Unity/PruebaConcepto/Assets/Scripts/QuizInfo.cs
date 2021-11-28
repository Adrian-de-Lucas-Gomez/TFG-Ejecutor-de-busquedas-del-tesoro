using Newtonsoft.Json.Linq;
using System.Collections.Generic;


[System.Serializable]
public class AdventureStage
{
    public string stage = "";
}


//Esta clase representa los datos con los que va a trabajar una fase de tipo quiz
[System.Serializable]
public class QuizInfo : AdventureStage
{
    public string pregunta = "Default Question";                                                     //Pregunta del quiz
    public List<PosibleAnswer> respuestas = new List<PosibleAnswer>();          //Lista de respuestas que se van a ofrecer al jugador

    public void readFromJSON(JObject myInfo)
    {
        stage = myInfo["tipo"].Value<string>();
        pregunta = myInfo["pregunta"].Value<string>();
        JArray misRespuestas = (JArray)myInfo["respuestas"];
        for (int i = 0; i < misRespuestas.Count; i++)
        {
            PosibleAnswer newAnswer = new PosibleAnswer();
            newAnswer.readFromJSON((JObject)misRespuestas[i]);
            respuestas.Add(newAnswer);
        }

    }
}