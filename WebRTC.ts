export class WebRTC {
    private readonly recievedVideo: HTMLMediaElement;
    private readonly localVideo: HTMLMediaElement;
    private readonly buttonElem: HTMLElement;
    private videoStream: MediaStream | undefined;
    private pc1: RTCPeerConnection;
    private pc2: RTCPeerConnection;
    private videoIsOn: boolean;


    constructor(localVideo: HTMLMediaElement, buttonId: HTMLElement, recievedVideo: HTMLMediaElement) {
        this.recievedVideo = recievedVideo;
        this.localVideo = localVideo;
        this.buttonElem = buttonId;
        this.videoIsOn = false;
        this.pc1 = new RTCPeerConnection();
        this.pc2 = new RTCPeerConnection();
    }


    public addListeners() {
        console.log(navigator.mediaDevices.enumerateDevices())
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
            console.log(1);
            let stream = new MediaStream();
            stream.addTrack(ev.track);

            // hides last flame of video
            // ev.track.addEventListener("mute", ev => {
            //     this.recievedVideo.style.display = 'none';
            // });
            // ev.track.addEventListener("unmute", ev => {
            //     this.recievedVideo.style.display = 'block';
            // });
            let received2 = <HTMLMediaElement>document.getElementById('received2');
            if (received2 !== null) {
                received2.srcObject = stream;
            }


        };


        this.buttonElem.addEventListener('click', () => {
            this.videoIsOn = !this.videoIsOn;
            this.showVideo()

        });



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

    public async createOfferAndAnswer() {
        let offerSdp = await this.pc1.createOffer();
        await this.pc1.setLocalDescription(offerSdp);
        await this.pc2.setRemoteDescription(offerSdp);

        let answerSdp = await this.pc2.createAnswer();
        await this.pc2.setLocalDescription(answerSdp);
        await this.pc1.setRemoteDescription(answerSdp);
    }


    private async connect() {

        const stats = () => {
            if (this.pc2.getReceivers()[0].track.getSettings().frameRate === 0) {
                this.recievedVideo.style.display = 'none';
            } else {
                this.recievedVideo.style.display = 'block';
            }
            //console.log(this.pc2.getReceivers()[0].transport.getRemoteCertificates())
        };

        setInterval(stats, 2000);

        this.addListeners();

        this.pc1.addTransceiver("video");
        //this.pc2.addTransceiver("video");
        this.createOfferAndAnswer();
    }

    public async showVideo() {
        let stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        this.localVideo.srcObject = stream;

        // let local2 = <HTMLMediaElement>document.getElementById('local2');
        // if (local2 !== null) {
        //     local2.srcObject = stream;
        // }

        let tracks = stream.getTracks();
        top:
            for (let track of tracks) {
                //console.log(track.getCapabilities());
                let senders = this.pc1.getSenders();
                for (let snd of senders) {

                    if (snd.track === null && this.videoIsOn) {
                        await snd.replaceTrack(track);
                        continue top;
                    } else if (snd.track !== null && !this.videoIsOn) {
                        await snd.replaceTrack(null);
                    }
                }

                // let senders2 = this.pc2.getSenders();
                // for (let snd of senders2) {
                //
                //     if (snd.track === null && this.videoIsOn) {
                //         await snd.replaceTrack(track);
                //         continue top;
                //     } else if (snd.track !== null && !this.videoIsOn) {
                //         await snd.replaceTrack(null);
                //     }
                // }

            }
    }

}


function isMediaElement(el: HTMLElement): el is HTMLMediaElement {
    return el instanceof HTMLMediaElement;
}
