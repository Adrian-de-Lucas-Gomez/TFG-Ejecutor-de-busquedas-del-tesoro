#!/bin/bash
echo Guardando Aventura...

#  Guardamos todos los elementos que forman la aventura en la "Base de datos" del server
adventureName=$1
echo el nombre de la aventura es $adventureName y el del parametro es $1 
mkdir -v ../BaseDeDatos/$adventureName
cp -r -f ./Images/. ../BaseDeDatos/$adventureName/ 
cp -v -f ../AdventureData.json ../BaseDeDatos/$adventureName/AdventureData.json  

exit 0