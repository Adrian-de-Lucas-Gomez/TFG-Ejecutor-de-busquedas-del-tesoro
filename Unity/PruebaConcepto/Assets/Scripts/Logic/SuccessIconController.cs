using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SuccessIconController : MonoBehaviour
{

    Animator animator;

    [SerializeField]
    GameObject correctImage;

    [SerializeField]
    GameObject incorrectImage;

    private void Start()
    {
        animator = GetComponent<Animator>();
    }

    public void showCorrect()
    {
        animator.SetBool("Appear", true);
        correctImage.SetActive(true);
    }

    void stopShowing()
    {
        animator.SetBool("Appear", false);
        correctImage.SetActive(false);
        incorrectImage.SetActive(false);
    }
}
