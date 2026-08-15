import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export function useVoiceCommands() {
  const { setWorkspaceMode, setTool, undo, redo, setColor, deleteObject, selectedObjectId } = useStore();
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let shouldRestart = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      if (shouldRestart) {
        try { recognition.start(); } catch(e) {}
      }
    };
    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e.error);
      if (e.error === 'not-allowed' || e.error === 'audio-capture') {
        shouldRestart = false;
      }
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      setLastCommand(transcript);
      
      // Basic NLP matching
      if (transcript.includes('2d')) setWorkspaceMode('2D');
      else if (transcript.includes('3d')) setWorkspaceMode('3D');
      else if (transcript.includes('particle')) setWorkspaceMode('PARTICLES');
      else if (transcript.includes('circle')) setTool('circle');
      else if (transcript.includes('rectangle') || transcript.includes('square')) setTool('rect');
      else if (transcript.includes('line')) setTool('line');
      else if (transcript.includes('undo')) undo();
      else if (transcript.includes('redo')) redo();
      else if (transcript.includes('red')) setColor('#ef4444');
      else if (transcript.includes('blue')) setColor('#3b82f6');
      else if (transcript.includes('green')) setColor('#10b981');
      else if (transcript.includes('yellow')) setColor('#eab308');
      else if (transcript.includes('white')) setColor('#ffffff');
      else if (transcript.includes('delete') && selectedObjectId) deleteObject(selectedObjectId);
    };

    try {
      recognition.start();
    } catch(e) {
      console.error(e);
    }

    return () => {
      shouldRestart = false;
      recognition.stop();
    };
  }, []);

  return { lastCommand, listening };
}
