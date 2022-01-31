using Newtonsoft.Json.Linq;
using System.Collections.Generic;


//Esta clase representa los datos con los que va a trabajar una fase de tipo quiz
[System.Serializable]
public class QuizInfo : AdventureInfo
{
    public string pregunta = "Default Question";                                //Pregunta del quiz
    public List<PosibleAnswer> respuestas = new List<PosibleAnswer>();          //Lista de respuestas que se van a ofrecer al jugador


    /// <summary>
    /// Metodo que recibe un objeto parseado de JSON y saca toda la informacion que necesite de este
    /// </summary>
    /// <param name="myInfo"> Objeto que salio de un JSON que contiene nuestra info </param>
    public void readFromJSON(JObject myInfo)
    {
        //Me quedo con la escena a la que me tengo que ir para ejecutarme
        stage = myInfo["tipo"].Value<string>();

        //Obtengo los datos del quiz
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