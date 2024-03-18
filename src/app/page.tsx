"use client";

import { useEffect } from "react";
import { getAccessToken } from "@/app/actions";
import useZoomVideo from "@/hooks/useZoomVideo";
import { ParticipantContainer } from "@/components/ParticipantContainer";
const sessionName = "test-session";

export default function Home() {
  const {
    connect,
    toggleVideo,
    toggleMic,
    mediaStream,
    zoomClient,
    localParticipant,
    remoteParticipant,
  } = useZoomVideo();

  useEffect(() => {
    if (!mediaStream) {
      getAccessToken(sessionName, 1).then((token) =>
        connect({ token, options: { sessionName, userName: "Test User" } })
      );
    }
  }, [zoomClient, mediaStream]);

  return (
    <main>
      <style>{`video-player-container { width: 400px; }`}</style>
      <div>Meeting Room</div>
      {mediaStream ? (
        <>
          <button onClick={toggleVideo}>Toggle Video</button>
          <button onClick={toggleMic}>Toggle Mic</button>
        </>
      ) : (
        "Connecting..."
      )}
      <video-player-container>
        {localParticipant && (
          <ParticipantContainer
            participant={localParticipant}
            mediaStream={mediaStream}
          />
        )}
        {remoteParticipant && (
          <ParticipantContainer
            participant={remoteParticipant}
            mediaStream={mediaStream}
          />
        )}
      </video-player-container>
    </main>
  );
}
