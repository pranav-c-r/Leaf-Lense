import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- ADD THIS IMPORT
import { Mic, MicOff, Hand, MessageSquare } from 'lucide-react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const InteractiveAssistant = () => {
    const [lastGesture, setLastGesture] = useState('None');
    const [lastVoiceAction, setLastVoiceAction] = useState('None');
    const [status, setStatus] = useState('Connecting...');
    const ws = useRef(null);
    const navigate = useNavigate(); // <-- INITIALIZE THE NAVIGATE HOOK

    const videoStreamUrl = 'http://127.0.0.1:8000/identifier/video_feed';
    const websocketUrl = 'ws://127.0.0.1:8000/interactive/ws/interactive';
    
    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();

    useEffect(() => {
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => setStatus('Connected');
    ws.current.onclose = () => setStatus('Disconnected');
    
    ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const { action, page, message: responseMessage } = message.data;

        if (message.type === 'voice_response' || message.type === 'gesture_action') {
            
            if (message.type === 'voice_response') {
                setLastVoiceAction(`${action}: ${responseMessage}`);
            } else {
                setLastGesture(responseMessage);
            }

            if (action === 'navigate' && page) {
                navigate(page);
            }
        }
    };

    return () => {
        if(ws.current) ws.current.close();
    };
}, []); // <-- CORRECTED LINE

    useEffect(() => {
        if (!isListening && transcript && ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(transcript);
        }
    }, [isListening, transcript]);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Interactive Farmer Assistant</h1>
                <p className="text-gray-400">Control the application with your hands and voice.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white mb-2">Live Camera Feed</h2>
                    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
                        <img src={videoStreamUrl} alt="Live feed" className="absolute top-0 left-0 w-full h-full object-cover" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <Hand className="h-5 w-5 mr-2 text-purple-400" /> Gesture Status
                        </h2>
                        <div className="bg-gray-700 rounded p-3 text-center">
                            <p className="text-sm text-gray-400">Last Gesture Action</p>
                            <p className="text-md font-semibold text-purple-300">{lastGesture}</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <Mic className="h-5 w-5 mr-2 text-cyan-400" /> Voice Control
                        </h2>
                        {hasRecognitionSupport ? (
                            <div className="space-y-3">
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`w-full py-3 rounded-lg flex items-center justify-center font-medium transition-colors ${
                                        isListening 
                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    {isListening ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                                    {isListening ? 'Stop Listening' : 'Start Listening'}
                                </button>
                                {isListening && <p className="text-sm text-center text-gray-300 animate-pulse">Listening...</p>}
                                {transcript && <p className="text-xs text-center text-gray-400">You said: "{transcript}"</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-red-400">Voice recognition is not supported in your browser.</p>
                        )}
                    </div>
                     <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <MessageSquare className="h-5 w-5 mr-2 text-yellow-400" /> System Response
                        </h2>
                        <div className="bg-gray-700 rounded p-3 text-center">
                            <p className="text-sm text-gray-400">Last Voice Action</p>
                            <p className="text-md font-semibold text-yellow-300">{lastVoiceAction}</p>
                        </div>
                         <p className="text-xs text-gray-500 mt-2 text-center">Status: {status}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveAssistant;