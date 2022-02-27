echo Generando Zip...

mkdir ..\tmp

xcopy ..\..\Unity\PruebaConcepto\Assets\ ..\tmp\Assets\ /E /S /Q /Y

xcopy ..\..\Unity\PruebaConcepto\Packages\ ..\tmp\Packages\ /E /S /Q /Y

xcopy ..\..\Unity\PruebaConcepto\ProjectSettings\ ..\tmp\ProjectSettings\ /E /S /Q /Y

@REM Copiamos las imagenes que hayan en el servidor en la carpeta de resources para el futuro acceso del proyecto
xcopy .\Images ..\tmp\Assets\Resources\AdventureImages /E /S /Q /Y

tar.exe -a -c -f ..\Aventura.zip ..\tmp

rmdir ..\tmp /s /q

exit