import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Languages, Clock, CheckCircle, AlertCircle, Copy, Download } from 'lucide-react';

const TranscriptDisplay = ({ 
  currentTranscript, 
  isListening, 
  isSpeaking, 
  onExportTranscript,
  className = "" 
}) => {
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentTranscript, transcriptHistory]);

  // Add completed transcripts to history
  useEffect(() => {
    if (currentTranscript?.finalTranscript && currentTranscript.finalTranscript.trim()) {
      const historyItem = {
        id: Date.now(),
        type: 'user',
        transcript: currentTranscript.finalTranscript,
        language: currentTranscript.language || 'hi',
        confidence: currentTranscript.confidence || 0,
        timestamp: new Date(),
        alternatives: currentTranscript.alternatives || []
      };
      
      setTranscriptHistory(prev => [...prev, historyItem]);
    }
  }, [currentTranscript?.finalTranscript]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getLanguageFlag = (langCode) => {
    const flags = {
      'hi': '🇮🇳', 'en': '🇬🇧', 'ta': '🇮🇳', 'te': '🇮🇳', 
      'ml': '🇮🇳', 'kn': '🇮🇳', 'bn': '🇮🇳', 'gu': '🇮🇳',
      'mr': '🇮🇳', 'pa': '🇮🇳', 'or': '🇮🇳', 'as': '🇮🇳'
    };
    return flags[langCode] || '🌐';
  };

  const getLanguageName = (langCode) => {
    const names = {
      'hi': 'Hindi', 'en': 'English', 'ta': 'Tamil', 'te': 'Telugu',
      'ml': 'Malayalam', 'kn': 'Kannada', 'bn': 'Bengali', 'gu': 'Gujarati',
      'mr': 'Marathi', 'pa': 'Punjabi', 'or': 'Odia', 'as': 'Assamese'
    };
    return names[langCode] || langCode.toUpperCase();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const exportTranscripts = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      transcripts: transcriptHistory.map(item => ({
        timestamp: item.timestamp,
        type: item.type,
        language: item.language,
        transcript: item.transcript,
        confidence: item.confidence
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-transcripts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onExportTranscript) {
      onExportTranscript(exportData);
    }
  };

  return (
    <div className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isListening && (
              <Mic className="h-5 w-5 text-red-400 animate-pulse" />
            )}
            {isSpeaking && (
              <Volume2 className="h-5 w-5 text-blue-400 animate-bounce" />
            )}
            <h3 className="text-lg font-semibold text-white">
              Live Transcript
            </h3>
          </div>
          
          {currentTranscript && (
            <div className="flex items-center space-x-2 text-sm">
              <Languages className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">
                {getLanguageFlag(currentTranscript.language)} 
                {getLanguageName(currentTranscript.language)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm text-slate-300 transition-colors"
          >
            <Clock className="h-4 w-4 inline mr-1" />
            History ({transcriptHistory.length})
          </button>
          
          {transcriptHistory.length > 0 && (
            <button
              onClick={exportTranscripts}
              className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg text-sm text-emerald-400 transition-colors"
            >
              <Download className="h-4 w-4 inline mr-1" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Current Transcript */}
      <div className="p-4">
        {currentTranscript && (currentTranscript.interimTranscript || currentTranscript.finalTranscript) ? (
          <div className="space-y-3">
            {/* Live/Interim Transcript */}
            {currentTranscript.interimTranscript && (
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400 flex items-center">
                    <Mic className="h-4 w-4 mr-2 animate-pulse text-red-400" />
                    Listening...
                  </span>
                </div>
                <p className="text-slate-300 italic text-sm leading-relaxed">
                  {currentTranscript.interimTranscript}
                </p>
              </div>
            )}

            {/* Final Transcript */}
            {currentTranscript.finalTranscript && (
              <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Recognized</span>
                    <div className={`flex items-center space-x-1 text-xs ${getConfidenceColor(currentTranscript.confidence)}`}>
                      {getConfidenceIcon(currentTranscript.confidence)}
                      <span>{Math.round((currentTranscript.confidence || 0) * 100)}%</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(currentTranscript.finalTranscript)}
                    className="p-1 hover:bg-slate-600/50 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-white font-medium leading-relaxed">
                  {currentTranscript.finalTranscript}
                </p>

                {/* Alternatives */}
                {currentTranscript.alternatives && currentTranscript.alternatives.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-emerald-600/20">
                    <p className="text-xs text-emerald-400 mb-2">Alternative recognitions:</p>
                    <div className="space-y-1">
                      {currentTranscript.alternatives.slice(1, 3).map((alt, index) => (
                        <div key={index} className="text-xs text-slate-400 flex items-center justify-between">
                          <span>{alt.transcript}</span>
                          <span className={getConfidenceColor(alt.confidence)}>
                            {Math.round((alt.confidence || 0) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Mic className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {isListening ? 'Listening for your voice...' : 'Click the microphone to start speaking'}
            </p>
          </div>
        )}
      </div>

      {/* Transcript History */}
      {showHistory && (
        <div className="border-t border-slate-700/50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Conversation History</h4>
            
            {transcriptHistory.length > 0 ? (
              <div ref={scrollRef} className="space-y-3 max-h-60 overflow-y-auto">
                {transcriptHistory.map((item, index) => (
                  <div key={item.id} className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span>{item.timestamp.toLocaleTimeString()}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          {getLanguageFlag(item.language)}
                          <span>{getLanguageName(item.language)}</span>
                        </span>
                        <span>•</span>
                        <div className={`flex items-center space-x-1 ${getConfidenceColor(item.confidence)}`}>
                          {getConfidenceIcon(item.confidence)}
                          <span>{Math.round(item.confidence * 100)}%</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(item.transcript)}
                        className="p-1 hover:bg-slate-600/50 rounded text-slate-400 hover:text-white transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {item.transcript}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No conversation history yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptDisplay;
