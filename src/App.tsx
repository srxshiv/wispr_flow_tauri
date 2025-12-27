import { useRef, useState, useEffect } from "react";
import { createClient, ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import useAudioRecorder from "./hooks/useUseAudioRecorder";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export default function App() {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [transcript, setTranscript] = useState<string>("");
  const socketRef = useRef<ListenLiveClient | null>(null);

  const isRecordingRef = useRef(false);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const lastToggleRef = useRef<number>(0);

  const handleStartRecording = () => {
    if (socketRef.current) {
        console.warn("connection already exist , cant start again");
        return;
    }
    
    setTranscript(""); 
    
    const deepgram = createClient(import.meta.env.VITE_DEEPGRAM_KEY);
    const connection = deepgram.listen.live({
      model: "nova-2",
      smart_format: true,
      language: "en-us",
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log("Connected to Deepgram");
      startRecording((blob) => {
        if (connection.getReadyState() === 1) {
          connection.send(blob);
        }
      });
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const text = data.channel.alternatives[0].transcript;
      if (text && text.trim().length > 0) {
        setTranscript((prev) => prev + " " + text);
        invoke("type_live", { text: text + " " });
      }
    });

    socketRef.current = connection;
  };

  const handleStop = () => {
    stopRecording();
    if (socketRef.current) {
      socketRef.current.finish();
      socketRef.current = null; 
    }
  };

  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await listen("toggle_recording", () => {
        const now = Date.now();
        if (now - lastToggleRef.current < 500) {
            return;
        }
        lastToggleRef.current = now;

        console.log("is Recording : ", isRecordingRef.current);

        if (isRecordingRef.current) {
          handleStop();
        } else {
          handleStartRecording();
        }
      });
      return unlisten;
    };

    const unlistenPromise = setupListener();

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100 p-6 selection:bg-zinc-700">
      <div className="w-full max-w-[320px] flex flex-col items-center gap-6">
        
        <h1 className="text-sm font-medium tracking-widest text-zinc-500 uppercase">
            Wispr Live
        </h1>

        <div className="relative group">
          <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-20 transition duration-1000 group-hover:opacity-50 ${isRecording ? 'animate-pulse opacity-60' : ''}`}></div>
          
          {!isRecording ? (
            <button 
                onClick={handleStartRecording}
                className="relative px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
            >
              Start Recording
            </button>
          ) : (
            <button 
                onClick={handleStop}
                className="relative px-8 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-all active:scale-95 shadow-red-900/20 shadow-xl"
            >
              Stop Recording
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`}></span>
            <p className="text-xs text-zinc-500 font-medium">
                {isRecording ? "Listening..." : "Idle"}
            </p>
        </div>

        <div className="w-full h-40 bg-zinc-900/50 rounded-2xl border border-white/5 p-4 overflow-y-auto text-sm text-zinc-300 leading-relaxed shadow-inner">
            {transcript ? (
                transcript
            ) : (
                <span className="text-zinc-600 italic text-xs">Transcription will appear here...</span>
            )}
        </div>
      </div>
    </div>
  );
}