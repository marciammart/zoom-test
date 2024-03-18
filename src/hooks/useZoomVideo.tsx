"use client";
import { useCallback, useEffect, useState } from "react";

interface IZoomConnectOptions {
  sessionName: string;
  userName: string;
}

export default function useZoomVideo() {
  const [zoomClient, setZoomClient] = useState();
  const [mediaStream, setMediaStream] = useState();
  const [localParticipant, setLocalParticipant] = useState();
  const [remoteParticipant, setRemoteParticipant] = useState();

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

      await zoomClient.init("en-US", "Global", {
        patchJsMedia: true,
        enforceMultipleVideos: true,
      });
      await zoomClient.join(options.sessionName, token, options.userName);
      const mediaStream = zoomClient!.getMediaStream();

      mediaStream.startAudio();

      setMediaStream(mediaStream);
    },
    [zoomClient]
  );

  const toggleVideo = async () => {
    const userId = zoomClient!.getCurrentUserInfo().userId;
    if (mediaStream!.isCapturingVideo()) {
      mediaStream!.stopVideo().then(() => mediaStream!.detachVideo(userId));
    } else {
      mediaStream!.startVideo();
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

  const updateParticipants = useCallback(
    (participants) => {
      const localParticipant = zoomClient?.getCurrentUserInfo();
      participants.forEach((participant) => {
        if (participant.userId === localParticipant?.userId)
          setLocalParticipant({ ...localParticipant, ...participant });
        else {
          const remoteParticipant = zoomClient?.getUser(participant.userId);
          setRemoteParticipant({ ...remoteParticipant, ...participant });
        }
      });
    },
    [zoomClient]
  );

  const removeParticipants = useCallback(
    (participants) => {
      const localParticipant = zoomClient?.getCurrentUserInfo();
      participants.forEach((participant) => {
        if (participant.userId === localParticipant?.userId)
          setLocalParticipant(undefined);
        else {
          setRemoteParticipant(undefined);
        }
      });
    },
    [zoomClient]
  );

  useEffect(() => {
    if (zoomClient) {
      window.addEventListener("unload", disconnect);
      window.addEventListener("pagehide", disconnect);

      zoomClient.on("user-added", updateParticipants);
      zoomClient.on("user-removed", removeParticipants);
      zoomClient.on("user-updated", updateParticipants);

      return () => {
        window.removeEventListener("unload", disconnect);
        window.removeEventListener("pagehide", disconnect);

        zoomClient.off("user-added", updateParticipants);
        zoomClient.off("user-removed", removeParticipants);
        zoomClient.off("user-updated", updateParticipants);

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
    localParticipant,
    remoteParticipant,
  };
}
