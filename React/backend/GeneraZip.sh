#!/bin/bash
echo Generando Zip...

mkdir ../tmp

cp -r -u -f ../../Unity/PruebaConcepto/Assets/ ../tmp/Assets/

cp -r -u -f ../../Unity/PruebaConcepto/Packages/ ../tmp/Packages/

cp -r -u -f ../../Unity/PruebaConcepto/ProjectSettings/ ../tmp/ProjectSettings/

zip -r ../Aventura.zip ../tmp

rm -rf ../tmp

exit 0