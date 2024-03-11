"use client";

import { useEffect } from "react";
import { getAccessToken } from "@/app/actions";
import useZoomVideo from "@/hooks/useZoomVideo";

const sessionName = "test-session";

export default function Home() {
  const { connect, toggleVideo, mediaStream, zoomClient } = useZoomVideo();

  useEffect(() => {
    if (!mediaStream) {
      getAccessToken(sessionName, 1).then((token) =>
        connect({ token, options: { sessionName, userName: "Test User" } })
      );
    }
  }, [zoomClient, mediaStream]);

  return (
    <main>
      <style>
        {`
        video-player-container {
          width: 100%;
        }
        video-player {
          width: 400px;
          height: auto;
        }
      `}
      </style>
      <div>Meeting Room</div>
      {mediaStream ? (
        <button onClick={toggleVideo}>Toggle Video</button>
      ) : (
        "Connecting..."
      )}
      <video-player-container></video-player-container>
    </main>
  );
}
