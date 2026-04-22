import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

type MicTranscriptPanelProps = {
  groqApiKey: string;
  transcriptEntries: { id: string; timestamp: string; text: string }[];
  setTranscriptEntries: React.Dispatch<React.SetStateAction<{ id: string; timestamp: string; text: string }[]>>;
  setSuggestionsTimerPaused: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MicTranscriptPanel({
  groqApiKey,
  transcriptEntries,
  setTranscriptEntries,
  setSuggestionsTimerPaused,
}: MicTranscriptPanelProps) {
  const TRANSCRIPT_CHUNK_MS = 30_000;
  const [isListening, setIsListening] = useState(false);
  const hasGroqKey = groqApiKey.trim().length > 0;
  const missingKeyMessage = 'Add your Groq API key in Settings to start recording.';

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldKeepRecordingRef = useRef(false);
  const chunkStopTimeoutRef = useRef<number | null>(null);

  useEffect(() => { //scrolls to the bottom of the transcript container when new entries are added  
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcriptEntries.length]);

  useEffect(() => {
    return () => {
      if (chunkStopTimeoutRef.current !== null) {
        window.clearTimeout(chunkStopTimeoutRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleClick = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    if (!hasGroqKey) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    shouldKeepRecordingRef.current = true;

    startMediaRecorder(stream);

    setIsListening(true);
    setSuggestionsTimerPaused(false);
  };

  const stopRecording = () => {
    shouldKeepRecordingRef.current = false;
    if (chunkStopTimeoutRef.current !== null) {
      window.clearTimeout(chunkStopTimeoutRef.current);
      chunkStopTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsListening(false);
    setSuggestionsTimerPaused(true);
  };

  const scheduleChunkStop = () => {
    if (chunkStopTimeoutRef.current !== null) {
      window.clearTimeout(chunkStopTimeoutRef.current);
    }

    chunkStopTimeoutRef.current = window.setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, TRANSCRIPT_CHUNK_MS);
  };

  const startMediaRecorder = (stream: MediaStream) => {
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size === 0) {
        return;
      }
      sendToWhisper(event.data);
    };

    mediaRecorder.onstop = () => {
      if (!shouldKeepRecordingRef.current) {
        return;
      }

      startMediaRecorder(stream);
    };

    mediaRecorder.start();
    scheduleChunkStop();
  };

  const sendToWhisper = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'en');

    const result = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
        },
      }
    );
    const text = result.data.text?.trim();
    if (!text) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    setTranscriptEntries((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp,
        text,
      },
    ]);
  };

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`h-16 w-16 rounded-full text-white cursor-pointer transition-colors ${isListening ? 'bg-red-500' : 'bg-blue-500'
            }`}
          onClick={handleClick}
          disabled={!isListening && !hasGroqKey}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {isListening ? 'Stop' : 'Start'}
        </button>
        <p className="text-sm text-gray-500">{isListening ? 'Recording' : 'Not recording'}</p>
      </div>
      {!hasGroqKey && <p className="text-sm text-red-600">{missingKeyMessage}</p>}
      <div
        ref={transcriptContainerRef}
        className="flex min-h-0 max-h-full flex-col gap-2 overflow-y-auto rounded-md border p-3"
      >
        <p>Transcript</p>
        {transcriptEntries.map((entry) => (
          <TranscriptBox
            key={entry.id}
            timestamp={entry.timestamp}
            transcript={entry.text}
          />
        ))}
      </div>
    </div>
  );
}

function TranscriptBox({ timestamp, transcript }: { timestamp: string, transcript: string }) {
  return (
    <div className="border border-gray-300 p-2 rounded-md">
      <p><span className="font-bold">{timestamp}</span> {transcript}</p>
    </div>
  );
}