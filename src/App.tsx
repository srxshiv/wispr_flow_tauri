import { useRef, useState } from "react";
import { createClient , ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import useAudioRecorder from "./hooks/useUseAudioRecorder";

export default function App() {
  const {isRecording , startRecording , stopRecording} = useAudioRecorder();
  const [transcript , setTranscript] = useState<string>("")

  const socketRef = useRef<ListenLiveClient | null>(null);

  const handleStartRecording = ()=>{
    const deepgram = createClient(import.meta.env.VITE_DEEPGRAM_KEY)

    const connection = deepgram.listen.live({
      model : "nova-2" ,
      smart_format: true ,
      language : "en-us"
    })

    connection.on(LiveTranscriptionEvents.Open , ()=>{
      console.log("connectes to deepgram")

      startRecording((blob)=>{
        if(connection.getReadyState()===1){
          connection.send(blob);
        }
      })
    })

    connection.on(LiveTranscriptionEvents.Transcript , (data)=>{
      const text = data.channel.alternatives[0].transcript;

      if(text) {
        setTranscript((prev)=> prev + " " + text)
      }
    })

    connection.on(LiveTranscriptionEvents.Close , ()=>{
      console.log("deepgram connection closedd")
    })

    socketRef.current = connection;
  }

  const handleStop = () =>{
    stopRecording();
    if(socketRef.current){
      socketRef.current.finish();
      socketRef.current = null;
    }
  }

  return <>
  <div>
    <h1>
      Wispr Flow for Subspace
    </h1>
    <div>
      {isRecording ?
     ( <button onClick={handleStop}>Stop Recording</button> ): 
     ( <button onClick={handleStartRecording}>Start Recording</button> )
      }
    </div>

    <div>
      <strong>Transcript : </strong>
      <div>
        <p>
          {transcript}
        </p>
      </div>
    </div>
  </div>
  </>
}