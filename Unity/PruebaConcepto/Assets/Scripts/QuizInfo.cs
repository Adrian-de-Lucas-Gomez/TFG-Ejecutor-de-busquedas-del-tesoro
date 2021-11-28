using System.Collections.Generic;


[System.Serializable]
public class AdventureStage
{
    public int id = 0;
}


//Esta clase representa los datos con los que va a trabajar una fase de tipo quiz
[System.Serializable]
public class QuizInfo : AdventureStage
{
    public string pregunta = "Default Question";                                                     //Pregunta del quiz
    public List<PosibleAnswer> respuestas = new List<PosibleAnswer>();          //Lista de respuestas que se van a ofrecer al jugador
}