import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import QRCodeStyling from "qr-code-styling";
import sign from "jwt-encode";


const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  dotsOptions: {
    color: "#4267b2",
    type: "rounded"
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 20
  }
});

function sendToPrinter(topic) {
    
  const body = new URLSearchParams({
      data: 'berhasil ke printer server',
      topic: topic,
  });
  const requestOptions = {
      method: 'POST',
      body,
      headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4'}
  }

  try {
      const resp = fetch('https://localhost/.well-known/mercure', requestOptions);   
      console.log(resp);
  } catch (e) {
      error(e);
  }
}

function createMercureEventSource(topic) {
  const secret = 'tes123';
    const data = {
        "mercure": {
            "subscribe": [topic]
        }
    }

  const jwt = sign(data, secret);
  const hub = new URL('http://localhost/.well-known/mercure');
  // const hub = new URL('https://m.gerubak.online/.well-known/mercure');
  hub.searchParams.append('topic', topic);
  
  return new EventSource(hub, {
    authorizationHeader: "Bearer " +jwt
  
  });
}

export default function App() {
  const [eventSource, setEventSource] = useState(null);
  const ref = useRef(null);

  const [value, setValue] = useState('');

  const topic = 'http://localhost/orderId=';


  const clientId = Date.now().toString();
  const newEventSource = eventSource ?? createMercureEventSource(topic + clientId);
  useEffect(() => {
    const waitingElement = document.getElementById('waiting');
    console.log(newEventSource.onmessage);
    
    newEventSource.onmessage = function (event) {
      console.log(event.data);
      qrCode.update({width: 0, height: 0});
      
      waitingElement.style.display = 'block';

      setTimeout(() => {
        waitingElement.style.display = 'none';
        qrCode.update({width: 300, height: 300});
      }, 5000);

      // sendToPrinter('any');
      
    }    

    setEventSource(newEventSource);


    qrCode.append(ref.current);

    // generate qr code once
    qrCode.update({
      data: topic + clientId,
    });

    // generate qr code every 5 seconds

  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      const newClientId = Date.now().toString();
      if (eventSource) {
        
        eventSource.close();
      }
      const newEventSource = createMercureEventSource(topic + newClientId);

      
      setEventSource(newEventSource);

      qrCode.update({
        data: topic + newClientId,
      });

    }, 15000);
    return () => clearInterval(interval);
  }, [eventSource]);



  return (
    <div className="App">

      <div ref={ref} />
      {/* <div className="container"> */}
      {/* <div className="row"> */}

      <div id="reader"></div>
      <div id="waiting" style={{ display: 'none' }}>
        <h1>Waiting to Print...</h1>
      </div>
      {/* </div> */}

      {/* </div> */}
      <div>{value}</div>
      {/* <Html5QrcodePlugin fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={onNewScanResult}></Html5QrcodePlugin> */}
    </div>
  );
}

const styles = {
  inputWrapper: {
    margin: "20px 0",
    display: "flex",
    justifyContent: "space-between",
    width: "100%"
  },
  inputBox: {
    flexGrow: 1,
    marginRight: 20
  },
  container: {
    display: "flex",
    width: "50%"
  }

};
