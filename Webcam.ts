import construct = Reflect.construct;

export class WebCam {
    private readonly videoField: HTMLMediaElement;
    private readonly buttonElem: HTMLElement;
    private readonly textField: HTMLElement;
    private readonly audioElem: HTMLMediaElement;
    private webCamIsOn: boolean = false;
    private videoStream: MediaStream | undefined;
    private audioStream: MediaStream | undefined;
    private devices: MediaDeviceInfo[] | undefined;


    constructor(videoField: HTMLMediaElement, textField: HTMLElement, buttonId: HTMLElement, audioElem: HTMLMediaElement) {
        this.textField = textField;
        this.videoField = videoField;
        this.audioElem = audioElem;
        this.buttonElem = buttonId;


    }

    static create(videoField: string, buttonId: string, audioField: string, textField: string): WebCam {
        let video = document.getElementById(videoField);
        let button = document.getElementById(buttonId);
        let audio = document.getElementById(audioField);
        let text = document.getElementById(textField);


        if (video === null || audio === null || text === null || button === null || !isMediaElement(video) || !isMediaElement(audio)) {
            throw "1;";
        }

        return new WebCam(video, text, button, audio);
    }


    public returnConnectedDevices() {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            this.devices = devices;
            this.textField.innerHTML = '';
            for (let dev of devices) {
                let device = document.createElement('p');
                device.innerText = dev.label;
                this.textField.append(device);
            }
        }).catch(e => console.error(e.message))
    }

    public loadConnectedDevices() {
        navigator.mediaDevices.ondevicechange = () => {
            this.returnConnectedDevices();
        }
    }

    public async addListenerToButton() {
        let i = 0;
        this.buttonElem.addEventListener('click', () => {
            this.getRandomVideo(++i % 2);
        })
    }


    public async getRandomVideo(index : number): Promise<void> {
        this.textField.innerHTML = '';
        let video = document.createElement("video");
        video.autoplay = true;
        let videoDevices: MediaDeviceInfo[] = [];
        await navigator.mediaDevices.enumerateDevices().then(devices => {
            console.log(devices);
            for (let device of devices) {
                if (device.kind === "videoinput") {
                    videoDevices.push(device);
                }
            }
        });

        navigator.mediaDevices.getUserMedia({
            video: {
                width: {exact: 640},
                height: {exact: 360},
                deviceId: {exact: videoDevices[index].deviceId}
            }
        }).then(stream => {
            if (this.videoStream !== undefined) {
                let videoTracks = this.videoStream.getTracks();
                for (let track of videoTracks) {
                    if (track.readyState === 'live') {
                        track.stop();
                    }
                }

                for (let track of videoTracks) {
                    console.log(track.readyState);
                }
            }


            this.videoStream = stream;
            video.srcObject = stream;

        }).catch(e => console.error(e));
        this.textField.append(video);


    }

    public async autoShowCam() {

        await navigator.mediaDevices.enumerateDevices().then(devices => {
            let videoDevices: MediaDeviceInfo[] = [];
            console.log(devices);
            for (let device of devices) {
                if (device.kind === "videoinput") {
                    videoDevices.push(device);
                }
            }
            if (videoDevices === []) {
                this.videoField.srcObject = null;
                throw 'No Webcams';
            }
            navigator.mediaDevices.ondevicechange = () => {
                navigator.mediaDevices.getUserMedia({
                    video: {
                        width: {exact: 640},
                        height: {exact: 360},
                    }
                }).then(stream => {
                    this.videoStream = stream;
                    this.videoField.srcObject = stream;
                })
            }
        });


    }

    public showCamWithPersonalParams() {
        this.buttonElem.addEventListener('click', () => {
            if (this.videoStream || this.videoStream !== undefined) {
                let videoTracks = this.videoStream.getVideoTracks();
                for (let track of videoTracks) {
                    console.log(track.readyState);
                    track.stop();
                }
            }

            let soundChecked = document.getElementById('sound');
            let widthInput = document.getElementById('width');
            let heightInput = document.getElementById('height');
            if (soundChecked === null || widthInput === null || heightInput === null) {
                throw 'error';
            }

            let width: number = parseInt((<HTMLInputElement>widthInput).value);
            let height: number = parseInt((<HTMLInputElement>heightInput).value);
            let withSound: boolean = (<HTMLInputElement>soundChecked).checked;


            navigator.mediaDevices.getUserMedia({
                video: {
                    width: width,
                    height: height,
                    deviceId: {exact: '3f541795d44409d1f81b90c80b8d7a4679ac6dd38a0878b716e15e0b3c0b4313'}
                },
                audio: withSound

            }).then(stream => {
                if (this.videoStream) {
                    for (let track of this.videoStream.getTracks()) {
                        if (track.readyState === 'live') {
                            track.stop()
                        }
                    }
                }
                this.videoStream = stream;
                this.videoField.srcObject = stream;
            }).catch(e => console.error(e));


        })

    }

    public showAllCams() {
        navigator.mediaDevices.enumerateDevices().then(devices => {

            for (let device of devices) {
                let video = document.createElement("video");
                video.autoplay = true;

                if (device.kind === "videoinput") {
                    console.log(device);
                    navigator.mediaDevices.getUserMedia({
                        video: {
                            width: {exact: 640},
                            height: {exact: 360},
                            deviceId: {exact: device.deviceId}
                        }
                    }).then(stream => {
                        video.srcObject = stream;
                    }).catch(e => console.error(e));
                }
                this.textField.append(video);
            }

        }).catch(e => console.error(e.message))

    }

    public getStream(width: number, height: number, withSound: boolean): void {
        this.buttonElem.addEventListener('click', () => {
            if (this.webCamIsOn && this.audioStream !== undefined && this.videoStream !== undefined) {

                this.webCamIsOn = false;

                for (let track of this.audioStream.getTracks()) {
                    track.stop();
                }

                for (let track of this.videoStream.getTracks()) {
                    track.stop();
                }

            } else {
                if (withSound) {
                    this.webCamIsOn = true;
                    navigator.mediaDevices.getUserMedia({
                        video: {width: width, height: height},
                        audio: true
                    }).then(stream => {
                        this.videoStream = stream;
                        this.videoField.srcObject = stream;
                    }).catch(e => console.error(e));
                } else {
                    this.webCamIsOn = true;
                    navigator.mediaDevices.getUserMedia({
                        video: {width: width, height: height}
                    }).then(stream => {
                        this.videoStream = stream;
                        this.videoField.srcObject = stream;
                    }).catch(e => console.error(e));
                }
                /*this.webCamIsOn = true;
                navigator.mediaDevices.getUserMedia({
                    video: {width: width, height: height}
                }).then(stream => {
                    this.videoStream = stream;
                    this.videoField.srcObject = stream;
                }).catch(e => console.error(e));

                navigator.mediaDevices.getUserMedia({
                    audio: true
                }).then(stream => {
                    this.audioStream = stream;
                    this.audioElem.srcObject = stream;
                }).catch(e => console.error(e));*/
            }
        })

    }

    /*public getAudioStream(): void {
        this.buttonElem.addEventListener('click', async () => {
            navigator.mediaDevices.getUserMedia({
                audio: true
            }).then(stream => {
                this.audioElem.srcObject = stream;
            }).catch(e => console.error(e))
        })
    }*/

}


function isMediaElement(el: HTMLElement): el is HTMLMediaElement {
    return el instanceof HTMLMediaElement;
}


