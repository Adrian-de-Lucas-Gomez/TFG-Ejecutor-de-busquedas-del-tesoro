#!/bin/bash
echo Generando Zip...

mkdir ../tmp

cp -r -u -f ../../Unity/PruebaConcepto/Assets/ ../tmp/Assets/

cp -r -u -f ../../Unity/PruebaConcepto/Packages/ ../tmp/Packages/

cp -r -u -f ../../Unity/PruebaConcepto/ProjectSettings/ ../tmp/ProjectSettings/

cp -r -u -f ./Images/. ../tmp/Assets/Resources/AdventureImages/

rm -f ../tmp/Assets/AdventureData.json

cp -u -f ../AdventureData.json ../tmp/Assets/AdventureData.json

cp -u -f  ../../Unity/PruebaConcepto/autoBuild.bat ../tmp/autoBuild.bat

zip -r ../Aventura.zip ../tmp

rm -rf ../tmp

exit 0