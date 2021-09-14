import React from "react";
import { CaptionsRenderer } from "react-srv3";
import useAnimationFrame from "../lib/useAnimationFrame";
import fxp from "fast-xml-parser";

const HomePage = () => {
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoURL, setVideoURL] = React.useState("");
  const [srv3File, setSrv3File] = React.useState<File | null>(null);
  const [srv3String, setSrv3String] = React.useState("");

  const [timeOffset, setTimeOffset] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);

  const videoPlayerRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (!videoFile) return;
    const url = URL.createObjectURL(videoFile);
    setVideoURL(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  React.useEffect(() => {
    if (!srv3File) return;
    const fr = new FileReader();
    fr.onload = () => setSrv3String(fr.result as string);
    fr.onerror = () => alert("Error reading captions file!");
    fr.readAsText(srv3File);
  }, [srv3File]);

  useAnimationFrame(() => {
    if (!videoPlayerRef.current) return;
    setCurrentTime(videoPlayerRef.current.currentTime);
  });

  const downloadString = (text: string, fileType: string, fileName: string) => {
    var blob = new Blob([text], { type: fileType });

    var a = document.createElement("a");
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 1500);
  };

  const doExportCaptions = () => {
    const options = {
      attributeNamePrefix: "@_",
      ignoreAttributes: false,
      trimValues: false,
    };
    const json = fxp.parse(srv3String, options);
    json.timedtext.body.p = json.timedtext.body.p.map((p: any) => {
      if (p["@_t"]) p["@_t"] = String(Number(p["@_t"]) + timeOffset);
      return p;
    });
    const j2x = new fxp.j2xParser(options);
    const xml = j2x.parse(json).replace(/^\n$/gm, "");
    downloadString(
      xml,
      srv3File?.type || "text/plain",
      "converted-" + srv3File?.name
    );
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-lg">
        <div
          className="relative w-full h-0"
          style={{ paddingBottom: "56.25%" }}
        >
          <video
            controls
            ref={videoPlayerRef}
            src={videoURL}
            className="absolute w-full h-full"
          />
          <div className="absolute w-full h-full pointer-events-none">
            <CaptionsRenderer
              key={srv3String}
              srv3={srv3String}
              currentTime={currentTime - timeOffset / 1000}
            />
          </div>
        </div>
      </div>
      <div className="py-4">
        <label className="bg-gray-300 px-4 py-2 rounded shadow cursor-pointer ml-4">
          <input
            type="file"
            className="hidden"
            accept="video/*"
            onChange={(e) => setVideoFile(e.currentTarget.files?.[0] || null)}
          />
          Select video file
        </label>
        <label className="bg-gray-300 px-4 py-2 rounded shadow cursor-pointer ml-4">
          <input
            type="file"
            className="hidden"
            onChange={(e) => setSrv3File(e.currentTarget.files?.[0] || null)}
          />
          Select srv3 file
        </label>
      </div>
      <div className="py-4">
        <label className="ml-4">
          Delay (ms)
          <input
            type="number"
            className="bg-gray-200 rounded px-4 py-2 ml-4"
            value={timeOffset}
            onChange={(e) => setTimeOffset(Number(e.target.value))}
          />
        </label>
      </div>
      <button
        type="button"
        onClick={doExportCaptions}
        className="bg-gray-300 px-4 py-2 rounded shadow cursor-pointer m-4"
      >
        Export srv3
      </button>
    </div>
  );
};

export default HomePage;
