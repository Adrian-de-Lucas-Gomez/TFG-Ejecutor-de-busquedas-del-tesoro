echo Generando Zip...

mkdir ..\tmp

xcopy ..\..\Unity\PruebaConcepto\Assets\ ..\tmp\Assets\ /E /S /Q /Y

xcopy ..\..\Unity\PruebaConcepto\Packages\ ..\tmp\Packages\ /E /S /Q /Y

xcopy ..\..\Unity\PruebaConcepto\ProjectSettings\ ..\tmp\ProjectSettings\ /E /S /Q /Y

tar.exe -a -c -f ..\Aventura.zip ..\tmp

rmdir ..\tmp /s /q

exit