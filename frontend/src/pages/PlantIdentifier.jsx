import { useState } from 'react';
import { Camera, Video, X, AlertTriangle, Loader2, PlayCircle, Cpu, Eye, Palette, Layers, GitBranch, ShieldCheck } from 'lucide-react';

const PlantIdentifier = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const streamUrl = 'http://127.0.0.1:8000/identifier/video_feed';

  const handleStartCamera = () => {
    setIsLoading(true);
    setHasError(false);
    setIsCameraActive(true);
  };

  const handleStopCamera = () => {
    setIsCameraActive(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-3">
            <Video className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Live Plant Identifier</h1>
        </div>
        <p className="text-gray-400">Real-time crop analysis using your camera</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        {isCameraActive ? (
          <div>
            <div
              className="relative w-full bg-black rounded-lg overflow-hidden"
              style={{ paddingTop: '56.25%' }}
            >
              {isLoading && !hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin text-green-400" />
                  <p className="mt-3 text-gray-300">Connecting to camera stream...</p>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                    <span className="text-red-300 text-sm">
                      Failed to connect. Ensure the backend server is running and the camera is available.
                    </span>
                  </div>
                </div>
              )}

              <img
                key={streamUrl}
                src={streamUrl}
                alt="Live video feed"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isLoading || hasError ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleStopCamera}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center font-medium"
              >
                <X className="h-4 w-4 mr-2" />
                Stop Camera
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Camera className="h-20 w-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-300 mb-3">
                Camera is Off
              </h3>
              <p className="text-gray-400 mb-8">
                Click the button below to start the live video feed for real-time plant analysis and health monitoring.
              </p>
              <button
                onClick={handleStartCamera}
                className="w-full max-w-xs py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 flex items-center justify-center font-medium text-base ml-14"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Camera
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Cpu className="h-8 w-8 text-green-400 mr-4 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-white">How It Works: A Look Under the Hood</h2>
            <p className="text-gray-400">Our system combines cutting-edge AI and computer vision to give you instant insights.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Eye className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="font-semibold text-white">AI-Powered Object Detection</h3>
            </div>
            <p className="text-sm text-gray-300">
              Each frame from the video feed is processed by a YOLOv8 model, a state-of-the-art neural network. It intelligently identifies and locates objects like plants and people within milliseconds, distinguishing them from the background.
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Palette className="h-5 w-5 text-purple-400 mr-2" />
              <h3 className="font-semibold text-white">Targeted Health Analysis</h3>
            </div>
            <p className="text-sm text-gray-300">
              Once a plant is detected, the system isolates that specific area. It then performs a rapid color-space analysis, creating a dynamic heatmap to identify yellow and brown areas that indicate stress, disease, or nutrient deficiency.
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Layers className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="font-semibold text-white">Real-Time Data Overlay</h3>
            </div>
            <p className="text-sm text-gray-300">
              The generated heatmap and health score are overlaid onto the original video stream. This processed feed is then sent back to your screen, providing immediate visual feedback on the condition of your crops as you scan them.
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <GitBranch className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="font-semibold text-white">Efficient Streaming Protocol</h3>
            </div>
            <p className="text-sm text-gray-300">
              We use an efficient MJPEG streaming protocol over a FastAPI backend. This ensures a low-latency, stable connection, allowing the complex analysis to feel instantaneous from your web browser without requiring any local installation.
            </p>
          </div>
        </div>
        
        <div className="mt-6 bg-green-900/30 border border-green-700/50 rounded-lg p-4 flex items-start">
            <ShieldCheck className="h-6 w-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="font-semibold text-white">The Farmer's Advantage</h3>
                <p className="text-sm text-gray-300 mt-1">
                  This technology empowers you to move from reactive to proactive crop management. By catching the earliest signs of trouble, you can apply targeted treatments, save costs on fertilizers and pesticides, and ultimately secure a healthier, more abundant yield.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlantIdentifier;