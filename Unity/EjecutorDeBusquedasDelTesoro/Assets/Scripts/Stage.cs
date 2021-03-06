using UnityEngine;
public abstract class Stage : MonoBehaviour
{
	public abstract void Init(AdventureInfo advInfo);
	public abstract void OnStageEnd();
}