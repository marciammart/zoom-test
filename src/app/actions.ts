"use server";

import KJUR from "jsrsasign";

export async function getAccessToken(sessionName: string, role: number) {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

  const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const payload = JSON.stringify({
    app_key: process.env.ZOOM_VIDEO_SDK_KEY,
    tpc: sessionName,
    role_type: role,
    version: 1,
    iat,
    exp,
  });

  const token = KJUR.jws.JWS.sign(
    "HS256",
    header,
    payload,
    process.env.ZOOM_VIDEO_SDK_SECRET
  );
  return token;
}
