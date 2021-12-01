import QRCode from "qrcode.react";
import {useState, useRef} from "react"

export const QR = () =>{
  
    //Referencia en el DOM al div que contiene el QR que renderizamos
    const qrRef = useRef(null);
    //Donde guardamos el texto a codificar en QR
    const [text, setText] = useState<string>("");
    
    //Metodo que se encarga de convertir el qr a formato png y descargarlo
    const downloadQRCode = (evt: React.FormEvent) => {
        //No refrescamos la pagina
        evt.preventDefault();
        //@ts-ignore (Esto es pa que no salte un error de typescript, sin esto no compila (porque asimila que es null))
        //Cogemos el primer elemento canvas que cuelga del div al que esta asociado la referencia
        // (qrcode.react esta representado como un <canvas></canvas>, si estuviese representado
        //con otra etiqueta habria que poner esa)
        let canvas = qrRef.current.querySelector("canvas");
        
        //devuelve un data URI el cual contiene una representación de una imagen en png
        let image:string = canvas.toDataURL("image/png");
        
        //Creamos un componente <a> html al que vamos a asignar la informacion
        //del QR qur vamos a descargar
        let anchor:HTMLAnchorElement = document.createElement("a");
        //le asignamos como referencia el qr ya convertido en imagen
        anchor.href = image;
        //Le ponemos el nombre con el que la vamos a descargar
        anchor.download = text +`.png`;
        //Metemos el componente <a> en el cuerpo de nuestro html de react
        document.body.appendChild(anchor);
        //Clicamos sobre el para descargarlo
        anchor.click();
        //Quitamos el componente <a> puesto que ya ha cumplido su funcion
        document.body.removeChild(anchor);
      };
 
    return (

        
    <div >
        <h3>Añada aqui el link al que reedirige el  QR:</h3>
        <form onSubmit={e => e.preventDefault()}>
            <input className="form-control" type="text" required value={text} onChange ={ e =>setText(e.target.value)}></input>
        </form>
        <div ref={qrRef}>
            <QRCode value={text} size={400} fgColor="black" bgColor="white" level="H"  />
        </div>
        <form onSubmit= {downloadQRCode}>
            <button className="btn btn-outline-primary mt-2" type="submit">Descargar QR</button>
        </form>
    </div>
    )
}