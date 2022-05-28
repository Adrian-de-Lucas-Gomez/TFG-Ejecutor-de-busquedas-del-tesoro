#!/bin/bash
echo Generando Zip...

#  Se crea un directorio temporal en el que se van a agrupar todas las cosas necesarias para crear la aventura
mkdir ../tmp

# Se añaden los directorios que componen el proyecto de Unity
cp -r -u -f ../../Unity/EjecutorDeBusquedasDelTesoro/Assets/ ../tmp/Assets/
cp -r -u -f ../../Unity/EjecutorDeBusquedasDelTesoro/Packages/ ../tmp/Packages/
cp -r -u -f ../../Unity/EjecutorDeBusquedasDelTesoro/ProjectSettings/ ../tmp/ProjectSettings/

# Copiamos las imagenes que hayan en el servidor en la carpeta de resources para el futuro acceso del proyecto
cp -r -u -f ./Images/. ../tmp/Assets/Resources/AdventureImages/

#Copiamos los unityPackages que nos ha subido el usuario
mkdir ../tmp/Assets/StreamingAssets/Vuforia/
cp -r -u -f ./Packages/. ../tmp/Assets/StreamingAssets/Vuforia/

#Metemos todo lo que haya en la carpeta temporal de imagenes que superponer a los targets en el proyecto de Unity
cp -r -u -f ./OverlappingImages/. ../tmp/Assets/Resources/OverlappingImages/

#Metemos todo lo que haya en la carpete temporal de sonidos en el proyecto de Unity
cp -r -u -f ./Sounds/. ../tmp/Assets/Resources/AdventureSounds/ 

#  Muevo el json con los datos de la aventura a donde se encuentra el proyecto
rm -f ../tmp/Assets/AdventureData.json
cp -u -f ../AdventureData.json ../tmp/Assets/AdventureData.json

#  Muevo el bat que sirve para lanzar la build desde consola (Para windows por ahora)
cp -u -f  ../../Unity/EjecutorDeBusquedasDelTesoro/autoBuild.bat ../tmp/autoBuild.bat

zip -r ../Aventura.zip ../tmp
rm -rf ../tmp
exit 0