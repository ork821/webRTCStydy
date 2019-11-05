export class WebRTC {
    constructor(localVideo, buttonId, recievedVideo) {
        this.recievedVideo = recievedVideo;
        this.localVideo = localVideo;
        this.buttonElem = buttonId;
        this.videoIsOn = false;
        this.pc1 = new RTCPeerConnection();
        this.pc2 = new RTCPeerConnection();
    }
    addListeners() {
        // navigator.mediaDevices.enumerateDevices().then(devices => {
        //     for (let device of devices) {
        //         if (device.kind === "videoinput") {
        //             this.webCams.push(device);
        //         }
        //     }
        // });
        this.pc1.onicecandidate = ev => {
            if (ev.candidate !== null)
                this.pc2.addIceCandidate(ev.candidate);
        };
        this.pc2.onicecandidate = ev => {
            if (ev.candidate !== null)
                this.pc1.addIceCandidate(ev.candidate);
        };
        this.pc2.ontrack = ev => {
            let stream = new MediaStream();
            stream.addTrack(ev.track);
            // hides last flame of video
            // ev.track.addEventListener("mute", ev => {
            //     this.recievedVideo.style.display = 'none';
            // });
            // ev.track.addEventListener("unmute", ev => {
            //     this.recievedVideo.style.display = 'block';
            // });
            this.recievedVideo.srcObject = stream;
        };
        this.pc1.ontrack = ev => {
            let stream = new MediaStream();
            stream.addTrack(ev.track);
            // hides last flame of video
            // ev.track.addEventListener("mute", ev => {
            //     this.recievedVideo.style.display = 'none';
            // });
            // ev.track.addEventListener("unmute", ev => {
            //     this.recievedVideo.style.display = 'block';
            // });
            let received2 = document.getElementById('received2');
            if (received2 !== null) {
                received2.srcObject = stream;
            }
        };
        this.buttonElem.addEventListener('click', () => {
            this.videoIsOn = !this.videoIsOn;
            this.showVideo();
            let bytesReceived = 0;
            const get_stats = () => {
                this.pc1.getStats().then((statsReport) => {
                    for (let stat of statsReport) {
                        if (stat[0].indexOf("RTCInbound") !== -1) {
                            if (stat[1].bytesReceived !== bytesReceived) {
                                this.recievedVideo.style.display = 'block';
                                let received2 = document.getElementById('received2');
                                if (received2 !== null) {
                                    received2.style.display = 'block';
                                }
                                bytesReceived = stat[1].bytesReceived;
                            }
                            else {
                                this.recievedVideo.style.display = 'none';
                                let received2 = document.getElementById('received2');
                                if (received2 !== null) {
                                    received2.style.display = 'none';
                                }
                            }
                        }
                    }
                });
            };
            setInterval(get_stats, 1000);
        });
    }
    static create(localVideo, buttonId, recVideo) {
        let local = document.getElementById(localVideo);
        let button = document.getElementById(buttonId);
        let rec = document.getElementById(recVideo);
        if (local === null || rec === null || button === null || !isMediaElement(local) || !isMediaElement(rec)) {
            throw "1;";
        }
        return new WebRTC(local, button, rec);
    }
    async createOfferAndAnswer() {
        let offerSdp = await this.pc1.createOffer();
        await this.pc1.setLocalDescription(offerSdp);
        await this.pc2.setRemoteDescription(offerSdp);
        let answerSdp = await this.pc2.createAnswer();
        await this.pc2.setLocalDescription(answerSdp);
        await this.pc1.setRemoteDescription(answerSdp);
        let offerSdp2 = await this.pc2.createOffer();
        await this.pc2.setLocalDescription(offerSdp2);
        await this.pc1.setRemoteDescription(offerSdp2);
        let answerSdp2 = await this.pc1.createAnswer();
        await this.pc1.setLocalDescription(answerSdp2);
        await this.pc2.setRemoteDescription(answerSdp2);
    }
    async connect() {
        // const stats = () => {
        //     if (this.pc2.getReceivers()[0].track.getSettings().frameRate === 0) {
        //         this.recievedVideo.style.display = 'none';
        //     } else {
        //         this.recievedVideo.style.display = 'block';
        //     }
        //     //console.log(this.pc2.getReceivers()[0].transport.getRemoteCertificates())
        // };
        //setInterval(stats, 2000);
        this.addListeners();
        this.pc1.addTransceiver("video");
        this.pc2.addTransceiver("video");
        this.createOfferAndAnswer();
    }
    async showVideo() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = [];
        for (let device of devices) {
            if (device.kind === "videoinput") {
                videoDevices.push(device);
            }
        }
        //console.log(videoDevices);
        let stream1 = await navigator.mediaDevices.getUserMedia({
            video: {
                height: 300,
                width: 640,
                deviceId: videoDevices[0].deviceId
            }
        });
        let stream2 = await navigator.mediaDevices.getUserMedia({
            video: {
                height: 300,
                width: 640,
                deviceId: { exact: videoDevices[1].deviceId },
            }
        });
        this.localVideo.srcObject = stream1;
        let local2 = document.getElementById('local2');
        if (local2 !== null) {
            local2.srcObject = stream2;
        }
        let tracks1 = stream1.getTracks();
        top1: for (let track of tracks1) {
            //console.log(track.getCapabilities());
            let senders = this.pc1.getSenders();
            for (let snd of senders) {
                if (snd.track === null && this.videoIsOn) {
                    await snd.replaceTrack(track);
                    continue top1;
                }
                else if (snd.track !== null && !this.videoIsOn) {
                    await snd.replaceTrack(null);
                }
            }
        }
        let tracks2 = stream2.getTracks();
        top2: for (let track of tracks2) {
            //console.log(track.getCapabilities());
            let senders = this.pc2.getSenders();
            for (let snd of senders) {
                if (snd.track === null && this.videoIsOn) {
                    await snd.replaceTrack(track);
                    continue top2;
                }
                else if (snd.track !== null && !this.videoIsOn) {
                    await snd.replaceTrack(null);
                }
            }
        }
    }
}
function isMediaElement(el) {
    return el instanceof HTMLMediaElement;
}
//# sourceMappingURL=WebRTC.js.map