echo Guardando Aventura...


@REM Guardamos todos los elementos que forman la aventura en la "Base de datos" del server
set adventureName=%1
mkdir ..\BaseDeDatos\%adventureName%
xcopy .\Images ..\BaseDeDatos\%adventureName% /E /S /Q /Y
xcopy ..\AdventureData.json ..\BaseDeDatos\%adventureName%  /Y

@REM exit