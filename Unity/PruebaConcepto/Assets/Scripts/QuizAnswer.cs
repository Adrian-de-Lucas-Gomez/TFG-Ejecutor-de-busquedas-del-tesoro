using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class QuizAnswer : MonoBehaviour
{
    public Text myAnswerText;
    public Toggle myToggle;

    public void setAnswertext(string newText)
    {
        myAnswerText.text = newText;
    }

    public bool isAnswerSelected() {
        return myToggle.isOn;
    }
}
