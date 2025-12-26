import { useRef, useState, useEffect } from "react";
import { createClient, ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import useAudioRecorder from "./hooks/useUseAudioRecorder";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export default function App() {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [transcript, setTranscript] = useState<string>("");
  const socketRef = useRef<ListenLiveClient | null>(null);

  // 1. STATE TRACKING REF (The Source of Truth)
  const isRecordingRef = useRef(false);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // 2. BOUNCE PROTECTION
  const lastToggleRef = useRef<number>(0);

  const handleStartRecording = () => {
    // --- SAFETY GUARD: PREVENT DOUBLE CONNECTIONS ---
    // If we already have a socket, DO NOT start another one.
    if (socketRef.current) {
        console.warn("Attempted to start recording, but connection already exists.");
        return;
    }
    // ------------------------------------------------
    
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

        console.log("Shortcut! isRecordingRef:", isRecordingRef.current);

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
    <div className="container">
      <h1>Wispr Live Typing</h1>
      <div style={{ marginBottom: "20px" }}>
        {!isRecording ? (
          <button onClick={handleStartRecording}>Start Recording</button>
        ) : (
          <button onClick={handleStop} style={{background: "red", color: "white"}}>
            Stop Recording
          </button>
        )}
      </div>
      
      <p><i>Status: {isRecording ? "Listening..." : "Idle"}</i></p>

      <div style={{ background: "#eee", padding: "10px", minHeight: "100px" }}>
        <strong>Transcript:</strong> {transcript}
      </div>
    </div>
  );
}