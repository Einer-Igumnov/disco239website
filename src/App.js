import { Html5Qrcode } from "html5-qrcode";
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isEnabled, setEnabled] = useState(false);
  const [name, setName] = useState("");
  const [class_name, setClassName] = useState("");
  const [arrived, setArrived] = useState(false);
  const [exists, setExists] = useState(false);
  const [qrMessage, setQrMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchUrl = "https://192.168.0.110:2399";

  useEffect(() => {
    const config = { fps: 10, qrbox: { width: 200, height: 200 } };

    const html5QrCode = new Html5Qrcode("qrCodeContainer");

    const qrScanerStop = () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then((ignore) => console.log("Scaner stop"))
          .catch((err) => console.log("Scaner error"));
      }
    };

    const qrCodeSuccess = async(decodedText) => {
      fetch(fetchUrl + '/get-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: decodedText }),
      }).then((res) =>
        res.json().then((data) => {
            setEnabled(false);
            setExists(data.exists);
            setQrMessage(decodedText);
            if(data.exists){
              setName(data.name);
              setClassName(data.class_name);
              setArrived(data.arrived);
              if(data.image_link !== ""){
                fetch(fetchUrl + '/get-image', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ image_link: data.image_link}),
                }).then((response) => response.blob().then((blob) => {
                  const url = URL.createObjectURL(blob);
                  setImageUrl(url);
              }));
              }
            }

        })
    );
    };

    if (isEnabled) {
      html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccess);
      setQrMessage("");
    } else {
      qrScanerStop();
    }

    return () => {
      qrScanerStop();
    };
  }, [isEnabled]);

  return (
    <div class="container">
      <div class="centered-container">
      {qrMessage && !exists && <p className="error-message">Вам подсунули хуйню</p>}
               {(qrMessage && exists) ? (imageUrl ? (
               <img
                     src={imageUrl}
                     alt="Fetched from Flask server"
                     style={{
                         borderRadius: '15px', 
                         width: '250px', 
                         height: 'auto',
                     }}
                 />
             ) : (
               <p>Нет фотки</p>
             )):(<p></p>)}
      {qrMessage && exists && <h1 className="name-message">{name}</h1>}
      {qrMessage && exists && <h1 className="name-message">{class_name}</h1>}
      {(qrMessage && exists && arrived) ? <h1 className="arrived-message">Уже входил</h1>:<p></p>}
      </div>
      <div class="centered-container">
      <div id="qrCodeContainer"   style = {{width: `${isEnabled * 300}px`, height: `${isEnabled * 300}px`, position: 'relative'}} / >
      </div>
      <button className="start-button" onClick={async() => {setEnabled(!isEnabled);}}>
         {isEnabled ? "Выключить камеру" : "Включить камеру"}
       </button>
  </div>
  );
}

export default App;