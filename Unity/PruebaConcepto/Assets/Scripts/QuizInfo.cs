using System.Collections.Generic;

//Esta clase representa los datos con los que va a trabajar una fase de tipo quiz
[System.Serializable]
public class QuizInfo
{
    public string pregunta;                                                     //Pregunta del quiz
    public List<PosibleAnswer> respuestas = new List<PosibleAnswer>();          //Lista de respuestas que se van a ofrecer al jugador
}