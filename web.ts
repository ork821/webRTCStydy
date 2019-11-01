export class WebRTC {
    private readonly recievedVideo: HTMLMediaElement;
    private readonly localVideo: HTMLMediaElement;
    private readonly buttonElem: HTMLElement;
    private videoStream: MediaStream | undefined;
    private pc1: RTCPeerConnection;
    private pc2: RTCPeerConnection;


    constructor(localVideo: HTMLMediaElement, buttonId: HTMLElement, recievedVideo: HTMLMediaElement) {
        this.recievedVideo = recievedVideo;
        this.localVideo = localVideo;
        this.buttonElem = buttonId;
        this.pc1 = new RTCPeerConnection();
        this.pc2 = new RTCPeerConnection();


    }

    public addListeners() {
        this.pc1.onicecandidate = ev => {
            if (ev.candidate !== null)
                this.pc2.addIceCandidate(ev.candidate);
        };

        this.pc2.onicecandidate = ev => {
            if (ev.candidate !== null)
                this.pc1.addIceCandidate(ev.candidate);
        };

        this.pc2.ontrack = ev => {
            if (!this.videoStream) {
                this.recievedVideo.srcObject = ev.streams[0];
            }
        };


    }

    static create(localVideo: string, buttonId: string, recVideo: string): WebRTC {
        let local = document.getElementById(localVideo);
        let button = document.getElementById(buttonId);
        let rec = document.getElementById(recVideo);


        if (local === null || rec === null || button === null || !isMediaElement(local) || !isMediaElement(rec)) {
            throw "1;";
        }

        return new WebRTC(local, button, rec);

    }

    private async connect() {
        this.addListeners();

        let stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        this.localVideo.srcObject = stream;
        let tracks = stream.getTracks();
        for (let track of tracks) {
            this.pc1.addTrack(track, stream);
        }

        let offerSdp = await this.pc1.createOffer();
        //console.log(offerSdp.sdp);
        await this.pc1.setLocalDescription(offerSdp);
        await this.pc2.setRemoteDescription(offerSdp);

        let answerSdp = await this.pc2.createAnswer();
        //console.log(offerSdp.sdp);
        await this.pc2.setLocalDescription(answerSdp);
        await this.pc1.setRemoteDescription(answerSdp);

    }


}


function isMediaElement(el: HTMLElement): el is HTMLMediaElement {
    return el instanceof HTMLMediaElement;
}
