import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import { Html5Qrcode } from "html5-qrcode";
import sign from "jwt-encode";


function sendOrderId(orderId) {
    
    const body = new URLSearchParams({
        data: 'kampret',
        topic: orderId,
    });

    const secret = 'tes123';
    const data = {
        "mercure": {
            "publish": [orderId]
        }
    }

    const jwt = sign(data, secret);

    const requestOptions = {
        method: 'POST',
        body,
        headers: {'Authorization': `Bearer ${jwt}`}
    }

    try {
        const resp = fetch('http://localhost/.well-known/mercure', requestOptions);   

        // const resp = fetch('https://m.gerubak.online/.well-known/mercure', requestOptions);   
        console.log(resp);
    } catch (e) {
        error(e);
    }
}

async function startScan() {
    await Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length >= 1) {
            var cameraId = "";
            if (devices.length == 1) cameraId = devices[0].id;
            if (devices.length == 2) cameraId = devices[1].id;

            const html5QrCode = new Html5Qrcode("reader");
            html5QrCode.start(
                cameraId,
                {
                    fps: 10,    // Optional, frame per seconds for qr code scanning
                    qrbox: { width: 600, height: 600 }  // Optional, if you want bounded box UIs
                },
                (decodedText, decodedResult) => {
                    console.log(decodedText);
                    sendOrderId(decodedText);
                    html5QrCode.stop();
                        
                    // devices.getVideoTracks()[0].stop();
                    // });

                    // do something when code is read
                },
                (errorMessage) => {
                    // parse error, ignore it.
                })
                .catch((err) => {
                    // Start failed, handle it.
                });
        }

    }).catch(err => {

    });

}

export default function QrScanner() {
    const ref = useRef(null);

    const [value, setValue] = useState('');



    return (
        <div>
            <div ref={ref} />
            {/* <div className="container"> */}
            {/* <div className="row"> */}

            <div id="reader"></div>
            {/* </div> */}

            {/* </div> */}
            <div>{value}</div>
            <button onClick={startScan}>tes</button>
            <span id="cam-qr-result">None</span>
        </div>
    );
}


