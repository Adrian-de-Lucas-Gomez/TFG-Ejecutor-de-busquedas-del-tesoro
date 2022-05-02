using System.Collections;
using System.Collections.Generic;
using System;
using UnityEngine;

public class SoundManager : MonoBehaviour
{
	public Sound[] sounds;
    [System.Serializable]
    public class Sound
	{
        public string name;
        public AudioClip clip;
        [Range(0f, 1f)]
        public float volume = 1;
        [Range(.1f, 3f)]
        public float pitch = 1;
		public bool loop;
		[HideInInspector]
		public AudioSource source;
	}
	private void Awake()
	{
		foreach (Sound s in sounds)
		{
			s.source = gameObject.AddComponent<AudioSource>();
			s.source.clip = s.clip;
			s.source.volume = s.volume;
			s.source.pitch = s.pitch;
			s.source.loop = s.loop;
		}
	}

	public void SMPlaySound(string name)
	{
		Sound s = Array.Find(sounds, sound => sound.name == name);
		if (s == null)
		{
			Debug.LogError("Sonido con nombre: "+name+" no encontrado");
			return;
		}
		s.source.Play();
	}
}
