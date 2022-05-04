using Newtonsoft.Json.Linq;
using System.Collections.Generic;

public class ImageInfo : AdventureInfo
{
    public string nombreImagen;
    public string descripcionFase;

    /// <summary>
    /// Metodo que recibe un objeto parseado de JSON y saca toda la informacion que necesite de este
    /// </summary>
    /// <param name="myInfo"> Objeto que salio de un JSON que contiene nuestra info </param>
    public void readFromJSON(JObject myInfo)
    {
        //Me quedo con la escena a la que me tengo que ir para ejecutarme
        stage = myInfo["tipo"].Value<string>();

        //Ponemos la pista al valor que nos de el JSON y en caso de que sea un valor vacio le ponemos un valor por defecto nosotros
        string value = myInfo["Pista"].Value<string>();
        if (value == "")    hint = "Sin pista";
        else                hint = value;

        //Obtengo los datos de la imagen
        string aux = myInfo["Imagen"].Value<string>();
        string[] splitArray = aux.Split('.');
        nombreImagen = splitArray[0];

        //Obtengo la explicacion de la imagen
        descripcionFase = myInfo["description"].Value<string>();
    }
}
