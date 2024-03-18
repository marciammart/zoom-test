import Mic from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { Typography } from "@mui/material";

import { useEffect, useRef } from "react";

export const ParticipantContainer = ({
  participant,
  mediaStream,
  showVideo = true,
}) => {
  const videoPlayerRef = useRef(null);

  useEffect(() => {
    if (participant.bVideoOn) {
      mediaStream.attachVideo(participant.userId, 3, videoPlayerRef.current);
    }
  }, [participant.bVideoOn]);

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "black",
      }}
    >
      <video-player
        node-id={participant.userId}
        media-type="video"
        ref={videoPlayerRef}
        style={{ width: "400px", height: "auto", aspectRatio: "16/9" }}
      ></video-player>
      {!participant.bVideoOn && showVideo ? (
        <VideoOffOverlay name={participant.displayName} />
      ) : (
        <VideoOnOverlay
          name={participant.displayName}
          audioOn={!participant.muted}
        />
      )}
    </div>
  );
};

const VideoOffOverlay = ({ name }: { name: string }) => {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Typography
        variant="h3"
        color="inherit"
        style={{ overflow: "hidden", maxHeight: "100%" }}
      >
        {name || ""}
      </Typography>
    </div>
  );
};

const VideoOnOverlay = ({
  name,
  audioOn,
}: {
  name: string;
  audioOn: boolean;
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "8px",
        left: "8px",
        padding: "4px 8px 4px 4px",
        backgroundColor: "black",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        opacity: "0.8",
        borderRadius: "2px",
      }}
    >
      {audioOn ? (
        <Mic style={{ fontSize: "16px", color: "white" }} />
      ) : (
        <MicOffIcon style={{ fontSize: "16px", color: "white" }} />
      )}
      <span
        style={{
          textTransform: "none",
          color: "white",
          fontFamily: "Arial",
          fontSize: "12px",
          lineHeight: "16px",
          letterSpacing: "0.4px",
        }}
      >
        {name}
      </span>
    </div>
  );
};
