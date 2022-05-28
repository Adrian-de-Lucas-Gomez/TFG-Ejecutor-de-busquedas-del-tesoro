using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(menuName = "Assets/Adventure")]
public class Adventure : ScriptableObject
{
    [Tooltip(".json file created from React.")]
    public TextAsset adventureFile;
}
