echo Generando Zip...

@REM Se crea un directorio temporal en el que se van a agrupar todas las cosas necesarias para crear la aventura
mkdir ..\tmp

@REM Se añaden los directorios que componen el proyecto de Unity
xcopy ..\..\Unity\EjecutorDeBusquedasDelTesoro\Assets\ ..\tmp\Assets\ /E /S /Q /Y
xcopy ..\..\Unity\EjecutorDeBusquedasDelTesoro\Packages\ ..\tmp\Packages\ /E /S /Q /Y
xcopy ..\..\Unity\EjecutorDeBusquedasDelTesoro\ProjectSettings\ ..\tmp\ProjectSettings\ /E /S /Q /Y


@REM Copiamos las imagenes que hayan en el servidor en la carpeta de resources para el futuro acceso del proyecto
xcopy .\Images ..\tmp\Assets\Resources\AdventureImages /E /S /Q /Y


@REM Copiamos las imagenes que hayan en el servidor en la carpeta de resources para el futuro acceso del proyecto
mkdir ..\tmp\Assets\StreamingAssets\Vuforia
xcopy .\Packages ..\tmp\Assets\StreamingAssets\Vuforia /E /S /Q /Y

@REM Metemos todo lo que haya en la carpeta temporal de imagenes que superponer a los targets en el proyecto de Unity
xcopy .\OverlappingImages ..\tmp\Assets\Resources\OverlappingImages /E /S /Q /Y

@REM Metemos todo lo que haya en la carpeta temporal de sonidos en el proyecto de Unity
xcopy .\Sounds ..\tmp\Assets\Resources\AdventureSounds /E /S /Q /Y

@REM Muevo el json con los datos de la aventura a donde se encuentra el proyecto
xcopy ..\AdventureData.json ..\tmp\Assets\AdventureData.json  /Y

@REM Muevo el bat que sirve para lanzar la build desde consola (Para windows por ahora)
xcopy  ..\..\Unity\EjecutorDeBusquedasDelTesoro\autoBuild.bat ..\tmp\  /Y

tar.exe -a -c -f ..\Aventura.zip ..\tmp

rmdir ..\tmp /s /q

echo el parametro es %adventureName%
@REM exit