import {useState , useRef } from 'react';

export default function useAudioRecorder () {
    const [isRecording , setIsRecording] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = async ( onDataAvailable : (data:Blob)=> void )=>{
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({audio : true});
            streamRef.current = mediaStream;

            mediaRecorder.current = new MediaRecorder(mediaStream , {mimeType : "audio/webm"})

            mediaRecorder.current.addEventListener("dataavailable" , (event)=>{
                if(event.data.size > 0){
                    onDataAvailable(event.data)
                }
            })

            mediaRecorder.current.start(150);
            setIsRecording(true);
        }
        catch(e){
            console.log("error while trying to access microphone \n" , e)
        }
    }

    const stopRecording = ()=>{
        if(mediaRecorder.current && mediaRecorder.current.state!=="inactive"){
            mediaRecorder.current.stop()
            mediaRecorder.current = null
        };
        if(streamRef.current){
            streamRef.current.getTracks().forEach((track)=>track.stop());
            streamRef.current=null;
        }
        setIsRecording(false);
    }

    return { isRecording ,startRecording , stopRecording}

}