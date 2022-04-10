echo Generando Zip...

@REM Se crea un directorio temporal en el que se van a agrupar todas las cosas necesarias para crear la aventura
mkdir ..\tmp

@REM Se añaden los directorios que componen el proyecto de Unity
xcopy ..\..\Unity\PruebaConcepto\Assets\ ..\tmp\Assets\ /E /S /Q /Y
xcopy ..\..\Unity\PruebaConcepto\Packages\ ..\tmp\Packages\ /E /S /Q /Y
xcopy ..\..\Unity\PruebaConcepto\ProjectSettings\ ..\tmp\ProjectSettings\ /E /S /Q /Y


@REM Copiamos las imagenes que hayan en el servidor en la carpeta de resources para el futuro acceso del proyecto
xcopy .\Images ..\tmp\Assets\Resources\AdventureImages /E /S /Q /Y

@REM Copiamos las imagenes que hayan en el servidor en la carpeta de resources para el futuro acceso del proyecto
mkdir ..\tmp\Assets\StreamingAssets\Vuforia
xcopy .\Packages ..\tmp\Assets\StreamingAssets\Vuforia /E /S /Q /Y

@REM MEtemos todo lo que haya en la carpete temporal de sonidos en el proyecto de Unity
xcopy .\Sounds ..\tmp\Assets\Resources\AdventureSounds /E /S /Q /Y

@REM Muevo el json con los datos de la aventura a donde se encuentra el proyecto
xcopy ..\AdventureData.json ..\tmp\Assets\AdventureData.json  /Y

@REM Muevo el bat que sirve para lanzar la build desde consola (Para windows por ahora)
xcopy  ..\..\Unity\PruebaConcepto\autoBuild.bat ..\tmp\  /Y

tar.exe -a -c -f ..\Aventura.zip ..\tmp

rmdir ..\tmp /s /q

echo el parametro es %adventureName%
@REM exit