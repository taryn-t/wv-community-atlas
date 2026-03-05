"use client";

import dynamic from "next/dynamic";

const WVCountiesMap = dynamic(() => import("./WVCountiesMap"), {
  ssr: false,
});

export default function MapClient() {
  return <WVCountiesMap />;
}