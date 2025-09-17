import { VideoCameraIcon } from '@heroicons/react/24/outline';

export default function VideoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Video Conferencing</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded p-8 shadow text-center">
        <VideoCameraIcon className="w-16 h-16 mx-auto text-brand-500" />
        <h2 className="mt-4 text-xl font-semibold">Virtual Classroom & Meetings</h2>
        <p className="mt-2 text-gray-500">
          This feature is a placeholder for a real-time video integration.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          (Integrate Jitsi, Agora, or a custom WebRTC solution here)
        </p>
        <button className="mt-6 bg-brand-600 text-white px-5 py-2 rounded hover:bg-brand-700">
          Start a Demo Call
        </button>
      </div>
    </div>
  );
}