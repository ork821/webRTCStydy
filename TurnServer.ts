// import TCSessionDescriptionParser from "tc-sdp/dist/Parser/TCSessionDescriptionParser";
// import TCSessionDescription from "tc-sdp/dist/TCSessionDescription";
// import TCSessionDescriptionCompiler from "tc-sdp/dist/Compiler/TCSessionDescriptionCompiler";
// import TCSessionDescriptionAVPMedia from "tc-sdp/dist/TCSessionDescriptionAVPMedia";

export class TurnServer {
    private readonly recievedVideo: HTMLMediaElement;
    private readonly localVideo: HTMLMediaElement;
    private readonly buttonElem: HTMLElement;
    private pc1: RTCPeerConnection;
    private pc2: RTCPeerConnection;
    private videoIsOn: boolean;


    constructor(localVideo: HTMLMediaElement, buttonId: HTMLElement, recievedVideo: HTMLMediaElement) {
        this.recievedVideo = recievedVideo;
        this.localVideo = localVideo;
        this.buttonElem = buttonId;
        this.videoIsOn = false;
        this.pc1 = new RTCPeerConnection({
            //rtcpMuxPolicy: "negotiate",
            iceServers: [
                {
                    urls: 'turn:turn.trueconf.com',
                    username: 'trialuser',
                    credential: 'U77aiewbgF5e',
                    credentialType: 'password'
                },
                {
                    urls: 'turn:turn.trueconf.ru',
                    username: 'trial',
                    credential: 'R45f5gEd7foz',
                    credentialType: 'password'
                },
            ],
        });

        this.pc2 = new RTCPeerConnection({
            //rtcpMuxPolicy: "negotiate",
            iceServers: [
                {
                    urls: 'turn:turn.trueconf.com',
                    username: 'trialuser',
                    credential: 'U77aiewbgF5e',
                    credentialType: 'password'
                },
                {
                    urls: 'turn:turn.trueconf.ru',
                    username: 'trial',
                    credential: 'R45f5gEd7foz',
                    credentialType: 'password'
                },
            ],
        });

    }

    public async createOfferAndAnswer() {
        let offerSdp = await this.pc1.createOffer();
        //console.log(offerSdp.sdp);
        //const parser: TCSessionDescriptionParser = new TCSessionDescriptionParser();
        //let info: TCSessionDescription = parser.parse(<string>offerSdp.sdp);
        //console.log(info);
        // let media : TCSessionDescriptionAVPMedia = <TCSessionDescriptionAVPMedia>info.getSessionMedia()[0];
        // let newPayloadList = new Map();
        // for (let pay of media.payloadList) {
        //     if (pay[1].encodingName === "VP9") {// ||pay[1].encodingName === "H264") {
        //         //console.log(pay);
        //         newPayloadList.set(pay[0], pay[1]);
        //     }
        // }
        //info.mediaGroupList = undefined;
        //const sessionMedia = <TCSessionDescriptionAVPMedia>info.getSessionMedia()[0];
        //sessionMedia.rtcpMultiplexing = false;

        //console.log(sessionMedia.quality);

        //console.log(sessionMedia);


        // const modifiedOffer : RTCSessionDescriptionInit = {
        //     sdp: new TCSessionDescriptionCompiler().compile(info),
        //     type: "offer"
        // };

        await this.pc1.setLocalDescription(offerSdp);
        await this.pc2.setRemoteDescription(offerSdp);

        let answerSdp = await this.pc2.createAnswer();

        // let infoAns: TCSessionDescription = parser.parse(<string>answerSdp.sdp);
        // const sessionMediaAns = <TCSessionDescriptionAVPMedia>infoAns.getSessionMedia()[0];
        //console.log(sessionMediaAns);
        //sessionMediaAns.rtcpMultiplexing = false;


        // const modifiedAnswer : RTCSessionDescriptionInit = {
        //     sdp: new TCSessionDescriptionCompiler().compile(infoAns),
        //     type: "answer"
        // };
        await this.pc2.setLocalDescription(answerSdp);
        await this.pc1.setRemoteDescription(answerSdp);


    }

    public addListeners() {
        // navigator.mediaDevices.enumerateDevices().then(devices => {
        //     for (let device of devices) {
        //         if (device.kind === "videoinput") {
        //             this.webCams.push(device);
        //         }
        //     }
        // });
        this.pc1.onicecandidate = ev => {
            //console.log(ev.candidate);
            /*if (ev.candidate !== null) {
                //console.log(ev.candidate.type);
                if (ev.candidate.type === "relay") {
                    this.pc2.addIceCandidate(ev.candidate);
                }
            }*/
            if (ev.candidate !== null) {
                //console.log(ev.candidate);
                //console.log('pc1 - ', ev.candidate.address, ev.candidate.port, ev.candidate.component);
                this.pc2.addIceCandidate(ev.candidate);
            }

        };

        this.pc2.onicecandidate = ev => {
            /*if (ev.candidate !== null && ev.candidate.address === "88.99.6.115") {
                if (ev.candidate.type === "relay") {
                    this.pc1.addIceCandidate(ev.candidate);
                }
            }*/
            if (ev.candidate !== null) {
                //console.log('pc2 - ', ev.candidate.address, ev.candidate.port, ev.candidate.component);
                this.pc1.addIceCandidate(ev.candidate);
            }
        };

        this.pc2.ontrack = ev => {
            let stream = new MediaStream();
            stream.addTrack(ev.track);
            this.recievedVideo.srcObject = stream;
        };

        this.buttonElem.addEventListener('click', async () => {
            this.videoIsOn = !this.videoIsOn;
            this.showVideo();

            //console.log(this.pc1.getReceivers());
            // let candidatePair = await this.pc1.getSenders()[0].transport.iceTransport.getSelectedCandidatePair();
            //
            // console.log(candidatePair);
            // console.log('local',candidatePair.local.address, candidatePair.local.port);
            // console.log('remote', candidatePair.remote.address, candidatePair.remote.port);
            window.setTimeout(async () => {
                let pair = null;
                let transport = null;

                const stats = await this.pc1.getStats();
                console.log(stats.entries());
                for (let [id, stat] of stats.entries()) {

                    console.log(stat);
                    if (stat.type === "candidate-pair") {
                        pair = stat;
                    } else if (stat.type === 'transport') {
                        transport = stat;
                    }
                }
                console.log(transport);
            }, 5000);
            // const stats2 = await this.pc2.getStats();
            // for (let [id, stat] of stats.entries()) {
            //
            //     //console.log(stat);
            //     if (stat.type === "candidate-pair") {
            //         pair = stat;
            //     } else if (stat.type === 'transport') {
            //         transport = stat;
            //     }
            // }
            //
            // for (let [id, stat] of stats.entries()) {
            //     if ((id === pair.localCandidateId) || (id === pair.remoteCandidateId)) {
            //         console.log(stat.ip, stat.port);
            //
            //     }
            // }
            // console.log('round time - ', pair.totalRoundTripTime);
            //
            // console.log(transport);


            // const getStats = () => {
            //     this.pc1.getStats().then((statsReport) => {
            //         for (let stat of statsReport) {
            //             console.log(stat);
            //         }
            //     });
            // };
            // getStats();
        });
    }

    public async showVideo() {
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


        this.localVideo.srcObject = stream1;

        let tracks1 = stream1.getTracks();
        top1:
            for (let track of tracks1) {
                //console.log(track.getCapabilities());
                let senders = this.pc1.getSenders();
                for (let snd of senders) {

                    if (snd.track === null && this.videoIsOn) {
                        await snd.replaceTrack(track);
                        continue top1;
                    } else if (snd.track !== null && !this.videoIsOn) {
                        await snd.replaceTrack(null);
                    }
                }
            }
    }


    private async connect() {
        this.addListeners();
        //this.showVideo();
        this.pc1.addTransceiver("video");

        this.createOfferAndAnswer();
    }

    static create(localVideo: string, buttonId: string, recVideo: string): TurnServer {
        let local = document.getElementById(localVideo);
        let button = document.getElementById(buttonId);
        let rec = document.getElementById(recVideo);


        if (local === null || rec === null || button === null || !isMediaElement(local) || !isMediaElement(rec)) {
            throw "1;";
        }

        return new TurnServer(local, button, rec);

    }
}


function isMediaElement(el: HTMLElement): el is HTMLMediaElement {
    return el instanceof HTMLMediaElement;
}