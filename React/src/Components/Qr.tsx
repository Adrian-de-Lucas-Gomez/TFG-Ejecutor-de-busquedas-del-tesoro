import QRCode from "react-qr-code";
import React, {useState, useRef, Fragment } from "react"
export const QR = () =>{

    //const qrRef = React.createRef<HTMLDivElement>();
    const [text, setText] = useState<string>("");

    type FormElement = React.FormEvent<HTMLFormElement>;
    
    const QR = (
        <QRCode id="qr-gen" value={text} size={256} bgColor="#282c34" fgColor="#fff" level="H"  />
    )

    //No funciona ninguno de los dos pero por lo menos con este genero un archivo png
    //aunque no se como meterle los datos al qr
    const downloadQR = (e:FormElement) =>{
        e.preventDefault()
        //const divQR = document.getElementById("qr-gen");
        //console.log(QR)
        //const blob = new Blob([QR.props], { type: 'image/jpeg' })
        //const image = new Image();
        ////image.src = URL.createObjectURL(blob);
        //const a = document.createElement('a')
        //a.download = "QR.jpeg"
        //a.href = window.URL.createObjectURL(blob)
        //const clickEvt = new MouseEvent('click', {
        //  view: window,
        //  bubbles: true,
        //  cancelable: true,
        //})
        //a.dispatchEvent(clickEvt)
        //a.remove()
    }
 
    return (
    <div >
        <form onSubmit={downloadQR}>
            <h3>Añada aqui el link al que reedirige el  QR:</h3>
            <input className="form-control" type="text" required value={text} onChange ={ e =>setText(e.target.value)}></input>
        </form>
        <div>
            {QR}
        </div>
    </div>
    )
}