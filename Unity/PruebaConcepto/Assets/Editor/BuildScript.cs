using UnityEditor;
using UnityEngine;
using UnityEditor.Build.Reporting;

// Output the build size or a failure depending on BuildPlayer.

public class BuildScript : MonoBehaviour
{
	public static void PerformBuild()
    {
        BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions();

		int sceneCount = UnityEngine.SceneManagement.SceneManager.sceneCountInBuildSettings;
		string[] scenes = new string[sceneCount];
		for (int i = 0; i < sceneCount; i++)
		{
			scenes[i] = UnityEngine.SceneManagement.SceneUtility.GetScenePathByBuildIndex(i);
		}
		buildPlayerOptions.scenes = scenes;
        buildPlayerOptions.locationPathName = "Builds/" + Application.productName + ".apk";
        buildPlayerOptions.target = BuildTarget.Android;
        buildPlayerOptions.options = BuildOptions.None;

        BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
        BuildSummary summary = report.summary;

        if (summary.result == BuildResult.Succeeded)
        {
            Debug.Log("Build succeeded: " + summary.totalSize + " bytes");
        }

        if (summary.result == BuildResult.Failed)
        {
            Debug.Log("Build failed");
        }
    }
}
