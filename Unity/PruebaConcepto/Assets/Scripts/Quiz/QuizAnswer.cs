using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Clase que representa una posible respuesta de un quiz
/// </summary>
public class QuizAnswer : MonoBehaviour
{
    [Tooltip("Texto de la UI en el que se va a mostrar la respuesta")]
    public TextMeshProUGUI myAnswerText;
    [Tooltip("Togle que sirve para ver si hemos seleccionado la resouesta como seleccionada o no")]
    public Toggle myToggle;

    /// <summary>
    /// Pone un texto concreto en el elemento de tipo Text de la UI que representa a la respuesta
    /// </summary>
    /// <param name="newText"> Nuevo texto que queremos que tenga la respuesta</param>
    public void setAnswertext(string newText)
    {
        myAnswerText.text = newText;
    }


    /// <summary>
    /// Devuelve si el toggle esta seleccionado o no
    /// </summary>
    /// <returns> True en caso de que el toggle de la respuesta este seleccionada, false en caso contrario </returns>
    public bool isAnswerSelected() {
        return myToggle.isOn;
    }
}
