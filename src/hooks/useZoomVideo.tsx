"use client";
import { useCallback, useEffect, useState } from "react";

interface IZoomConnectOptions {
  sessionName: string;
  userName: string;
}

export default function useZoomVideo() {
  const [zoomClient, setZoomClient] = useState();
  const [mediaStream, setMediaStream] = useState();

  useEffect(() => {
    const { default: ZoomVideo } = require("@zoom/videosdk");
    const client = ZoomVideo.createClient();
    setZoomClient(client);

    return () => {
      setZoomClient(undefined);
      ZoomVideo.destroyClient();
    };
  }, []);

  const connect = useCallback(
    async ({
      token,
      options,
    }: {
      token: string;
      options: IZoomConnectOptions;
    }) => {
      if (!zoomClient) return;

      await zoomClient.init("en-US", "Global", { patchJsMedia: true });
      await zoomClient.join(options.sessionName, token, options.userName);
      const mediaStream = zoomClient!.getMediaStream();
      setMediaStream(mediaStream);

      // render videos of participants already in the meeting
      zoomClient!.getAllUser().forEach((user) => {
        if (user.bVideoOn) {
          mediaStream.attachVideo(user.userId, 3).then((userVideo) => {
            const videoContainer = document.querySelector(
              "video-player-container"
            ) as Element;
            videoContainer.appendChild(userVideo as VideoPlayer);
          });
        }
      });
    },
    [zoomClient]
  );

  const toggleVideo = async () => {
    const userId = zoomClient!.getCurrentUserInfo().userId;
    if (mediaStream!.isCapturingVideo()) {
      mediaStream!.stopVideo().then(() => mediaStream!.detachVideo(userId));
    } else {
      const videoPlayerContainer = document.querySelector(
        "video-player-container"
      );
      mediaStream!.startVideo().then(() => {
        mediaStream!.attachVideo(userId, 3).then((userVideo) => {
          console.log("local user video player", userVideo);
          videoPlayerContainer?.appendChild(userVideo as VideoPlayer);
        });
      });
    }
  };

  const toggleMic = async () => {
    if (zoomClient!.getCurrentUserInfo().muted) {
      zoomClient!.getMediaStream().unmuteAudio();
    } else {
      zoomClient!.getMediaStream().muteAudio();
    }
  };

  const disconnect = () => {
    if (zoomClient) {
      const mediaStream = zoomClient.getMediaStream();
      mediaStream.stopVideo();
      mediaStream.muteAudio();
      zoomClient.leave();
    }
  };

  const handlePeerVideoStateChange = (payload) => {
    const mediaStream = zoomClient.getMediaStream();
    if (payload.action === "Start") {
      // a user turned on their video, render it
      mediaStream.attachVideo(payload.userId, 3).then((userVideo) => {
        const videoPlayerContainer = document.querySelector(
          "video-player-container"
        ) as Element;
        console.log("remote user video player", userVideo);
        videoPlayerContainer.appendChild(userVideo as VideoPlayer);
      });
    } else if (payload.action === "Stop") {
      // a user turned off their video, stop rendering it
      mediaStream.detachVideo(payload.userId);
    }
  };

  useEffect(() => {
    if (zoomClient) {
      window.addEventListener("unload", disconnect);
      window.addEventListener("pagehide", disconnect);

      zoomClient.on("peer-video-state-change", handlePeerVideoStateChange);

      return () => {
        window.removeEventListener("unload", disconnect);
        window.removeEventListener("pagehide", disconnect);

        zoomClient.off("peer-video-state-change", handlePeerVideoStateChange);

        disconnect();
      };
    }
  }, [zoomClient]);

  return {
    zoomClient,
    mediaStream,
    disconnect,
    connect,
    toggleVideo,
    toggleMic,
  };
}
