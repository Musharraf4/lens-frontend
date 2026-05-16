import React, { useEffect, useRef, useState } from "react";
import { useChatbotBuilder } from "@/store/ChatbotBuilderContext";
import VideoUploader from "@/components/chatbot/VideoUploader";
import PreviewLandingPage from "@/components/chatbot/PreviewLandingPage";
import ChatbotPreview from "@/components/chatbot/ChatbotPreview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { uploadAttachment } from "@/services/chatbot.api";
import { shortenUrl } from "@/lib/utils";
import { showToast } from "@/components/Toast";
import { IoCheckmarkCircle } from "react-icons/io5";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DialogsStepProps {
  showPreview?: boolean;
}

const DialogsStep: React.FC<DialogsStepProps> = ({ showPreview = true }) => {
  const { state, setFirstLastMessages } = useChatbotBuilder();
  const { position } = state.botAppearance;
  const { selectedDevice } = state;
  const [openAccordionId, setOpenAccordionId] = useState<string | undefined>(
    "first-dialog"
  );

  const handleValueChange = (value: string | undefined) => {
    setOpenAccordionId(value);
  };

  const {
    firstDialogVideo,
    lastDialogVideo,
    firstDialogFileName,
    lastDialogFileName,
  } = state.firstLastMessages;

  // Recording state and refs
  const [recordingKind, setRecordingKind] = useState<"first" | "last" | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isListeningStop, setIsListeningStop] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingKind, setUploadingKind] = useState<"first" | "last" | null>(
    null
  );
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
  const [isValidAspectRatio, setIsValidAspectRatio] = useState<boolean | null>(null);
  const [isValidFileSize, setIsValidFileSize] = useState<boolean | null>(null);
  const previewVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoUrlRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const cleanupMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setIsListeningStop(false);
    setRecordingKind(null);
  };

  const stopSpeechRecognition = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    } catch (_) {
      /* noop */
    }
    recognitionRef.current = null;
    setIsListeningStop(false);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const results = Array.from(event.results);
        const transcript = results
          .map((r: any) => r[0]?.transcript || "")
          .join(" ")
          .toLowerCase();
        if (
          transcript.includes("stop recording") ||
          transcript.trim() === "stop"
        ) {
          stopRecording();
        }
      };
      recognition.onerror = () => {
        stopSpeechRecognition();
      };
      recognition.onend = () => {
        // Try to keep listening during recording
        if (isRecording) {
          startSpeechRecognition();
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
      setIsListeningStop(true);
    } catch (_) {
      // Ignore speech errors, recording still works
    }
  };

  const startRecording = async (kind: "first" | "last") => {
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          } as any,
          audio: { echoCancellation: true, noiseSuppression: true } as any,
        } as MediaStreamConstraints);
      } catch (_) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }
      mediaStreamRef.current = stream;
      if (previewVideoRef.current) {
        const videoEl = previewVideoRef.current;
        const videoOnly = new MediaStream(stream.getVideoTracks());
        try {
          (videoEl as any).srcObject = videoOnly;
        } catch (_) {
          videoEl.src = URL.createObjectURL(videoOnly as any);
        }
        videoEl.muted = true;
        (videoEl as any).playsInline = true;
        await new Promise(requestAnimationFrame);
        try {
          await videoEl.play();
        } catch (_) {
          /* ignore */
        }
      }
      const options: MediaRecorderOptions = {
        mimeType: "video/webm;codecs=vp9,opus",
      } as any;
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (_) {
        recorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const fileName = `${kind}-dialog-${Date.now()}.webm`;

        // Validate file size (100MB)
        if (blob.size > 100 * 1024 * 1024) {
          showToast({
            type: "error",
            title: "File too large",
            description: "Video size should be less than 100MB",
          });
          cleanupMedia();
          return;
        }

        const file = new File([blob], fileName, { type: "video/webm" });
        const blobUrl = URL.createObjectURL(blob);

        // Show preview modal
        previewVideoUrlRef.current = blobUrl;
        setPreviewVideoUrl(blobUrl);
        setPreviewVideoFile(file);
        setPreviewModalOpen(true);

        // Show uploading loader and send to backend
        setIsUploading(true);
        setUploadingKind(kind);
        try {
          const uploadResponse = await uploadAttachment(file, "video");
          const urlFromApi = uploadResponse?.url || "";
          if (kind === "first") {
            setFirstLastMessages({
              ...state.firstLastMessages,
              firstDialogVideo: urlFromApi,
              firstDialogFileName: urlFromApi,
            });
          } else {
            setFirstLastMessages({
              ...state.firstLastMessages,
              lastDialogVideo: urlFromApi,
              lastDialogFileName: urlFromApi,
            });
          }
        } catch (_) {
          showToast({
            type: "error",
            title: "Upload failed",
            description:
              "Failed to upload video. Request Entity Too Large, Please try again.",
          });
        } finally {
          setIsUploading(false);
          setUploadingKind(null);
          stopSpeechRecognition();
          cleanupMedia();
        }
      };
      setRecordingKind(kind);
      setIsRecording(true);
      startSpeechRecognition();
      recorder.start();
    } catch (err) {
      cleanupMedia();
    }
  };

  const stopRecording = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    } catch (_) { }
    stopSpeechRecognition();
  };

  // Attach stream to preview video after the element mounts to avoid black screen
  useEffect(() => {
    if (!isRecording || !previewVideoRef.current || !mediaStreamRef.current)
      return;
    const video = previewVideoRef.current;
    try {
      const videoOnly = new MediaStream(
        mediaStreamRef.current.getVideoTracks()
      );
      (video as any).srcObject = videoOnly;
    } catch (_) {
      const videoOnly = new MediaStream(
        mediaStreamRef.current.getVideoTracks()
      );
      video.src = URL.createObjectURL(videoOnly as any);
    }
    video.muted = true;
    (video as any).playsInline = true;
    const play = async () => {
      try {
        await new Promise(requestAnimationFrame);
        await video.play();
      } catch (_) {
        /* ignore */
      }
    };
    if (video.readyState >= 2) {
      play();
    } else {
      const handler = () => {
        video.removeEventListener("loadedmetadata", handler);
        play();
      };
      video.addEventListener("loadedmetadata", handler);
      return () => video.removeEventListener("loadedmetadata", handler);
    }
  }, [isRecording, recordingKind]);

  // Validate video aspect ratio and file size when preview modal opens
  useEffect(() => {
    if (!previewModalOpen || !previewVideoElementRef.current) {
      return;
    }

    const video = previewVideoElementRef.current;

    // Validate file size if file is available
    if (previewVideoFile) {
      const fileSizeMB = previewVideoFile.size / (1024 * 1024);
      setIsValidFileSize(fileSizeMB <= 100);
    } else {
      // If no file, we can't validate file size
      setIsValidFileSize(null);
    }

    // Validate aspect ratio
    const checkAspectRatio = () => {
      if (video.videoWidth && video.videoHeight) {
        const aspectRatio = video.videoWidth / video.videoHeight;
        // 9:16 ratio = 0.5625, allow small tolerance
        const targetRatio = 9 / 16;
        const tolerance = 0.05;
        const isValid = Math.abs(aspectRatio - targetRatio) <= tolerance;
        setIsValidAspectRatio(isValid);
      }
    };

    if (video.readyState >= 2) {
      checkAspectRatio();
    } else {
      const handler = () => {
        checkAspectRatio();
        video.removeEventListener("loadedmetadata", handler);
      };
      video.addEventListener("loadedmetadata", handler);
      return () => video.removeEventListener("loadedmetadata", handler);
    }
  }, [previewModalOpen, previewVideoFile]);

  // Use context for controlling ChatbotPreview display state
  const { chatbotState, toggleChatbotState } = useChatbotBuilder();

  // Toggle preview state using context
  const togglePreviewState = () => {
    toggleChatbotState();
  };

  const handleFirstVideoPreview = (videoUrl: string, file?: File) => {
    previewVideoUrlRef.current = videoUrl;
    setPreviewVideoUrl(videoUrl);
    setPreviewVideoFile(file || null);
    setPreviewModalOpen(true);
  };

  const handleFirstVideoUpload = (videoDataUrl: string, fileName: string) => {
    setFirstLastMessages({
      ...state.firstLastMessages,
      firstDialogVideo: videoDataUrl,
      firstDialogFileName: fileName,
    });
  };

  const handleFirstVideoDelete = () => {
    setFirstLastMessages({
      ...state.firstLastMessages,
      firstDialogVideo: null,
    });
  };

  const handleLastVideoPreview = (videoUrl: string, file?: File) => {
    previewVideoUrlRef.current = videoUrl;
    setPreviewVideoUrl(videoUrl);
    setPreviewVideoFile(file || null);
    setPreviewModalOpen(true);
  };

  const handleLastVideoUpload = (videoDataUrl: string, fileName: string) => {
    setFirstLastMessages({
      ...state.firstLastMessages,
      lastDialogVideo: videoDataUrl,
      lastDialogFileName: fileName,
    });
  };

  const handleLastVideoDelete = () => {
    setFirstLastMessages({
      ...state.firstLastMessages,
      lastDialogVideo: null,
    });
  };

  // Preview component
  const preview = (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <div className="h-[600px] relative">
        <PreviewLandingPage position={position}>
          <ChatbotPreview />
        </PreviewLandingPage>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* <div>
        <h2 className="text-xl sm:text-2xl font-bold">First & Last Dialogs</h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Customize the first and last messages your users will see.</p>
      </div> */}

      {/* Mobile Preview Toggle Button */}
      <div className="block md:hidden mb-4">
        <button
          onClick={togglePreviewState}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium flex items-center justify-center gap-2"
        >
          {chatbotState === "open" ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {/* Mobile Preview (Collapsible) */}
      {chatbotState === "open" && (
        <div className="block md:hidden mb-4 h-[400px] overflow-hidden rounded-lg">
          {preview}
        </div>
      )}

      <div
        className={
          showPreview
            ? `grid gap-4 md:gap-6 ${selectedDevice === "web"
              ? "grid-cols-1 md:grid-cols-12"
              : selectedDevice === "tablet"
                ? "grid-cols-1"
                : "grid-cols-1"
            }`
            : "space-y-6"
        }
      >
        <div
          className={
            showPreview
              ? `${selectedDevice === "web"
                ? "col-span-1 md:col-span-3"
                : selectedDevice === "tablet"
                  ? "col-span-1"
                  : "col-span-1"
              }`
              : "w-full"
          }
        >
          <div className="space-y-4">
            <Accordion
              type="single"
              collapsible
              value={openAccordionId}
              onValueChange={handleValueChange}
              className="w-full"
            >
              {/* First Dialog Accordion */}
              <AccordionItem
                value="first-dialog"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {openAccordionId !== "first-dialog" && firstDialogVideo ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        1
                      </div>
                    )}
                    <span>First Dialog</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4">
                    {firstDialogVideo ? (
                      <div className="mt-4">
                        <VideoUploader
                          currentVideo={firstDialogVideo}
                          fileName={shortenUrl(firstDialogFileName)}
                          onVideoUpload={handleFirstVideoUpload}
                          onVideoDelete={handleFirstVideoDelete}
                          onVideoPreview={handleFirstVideoPreview}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 ">
                        <div className="col-span-1">
                          <button
                            onClick={() => startRecording("first")}
                            className="w-full h-14 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                          >
                            <svg
                              className="w-6 h-6 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-sm">Record</span>
                          </button>
                        </div>
                        <div className="col-span-1">
                          <VideoUploader
                            currentVideo={firstDialogVideo}
                            fileName={shortenUrl(firstDialogFileName)}
                            onVideoUpload={handleFirstVideoUpload}
                            onVideoDelete={handleFirstVideoDelete}
                            onVideoPreview={handleFirstVideoPreview}
                          />
                        </div>
                      </div>
                    )}

                    {isUploading && uploadingKind === "first" && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                        Uploading video...
                      </div>
                    )}

                    {!isUploading &&
                      isRecording &&
                      recordingKind === "first" && (
                        <div className="mt-4 border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 text-sm flex items-center justify-between">
                            <span className="text-gray-700">
                              Recording...{" "}
                              {isListeningStop &&
                                '(listening for "stop recording")'}
                            </span>
                            <button
                              onClick={stopRecording}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Stop
                            </button>
                          </div>
                          <div className="aspect-video bg-black">
                            <video
                              ref={(el) => {
                                previewVideoRef.current = el;
                                if (el && mediaStreamRef.current) {
                                  try {
                                    (el as any).srcObject =
                                      mediaStreamRef.current;
                                  } catch (_) {
                                    el.src = URL.createObjectURL(
                                      mediaStreamRef.current as any
                                    );
                                  }
                                  el.muted = true;
                                  el.playsInline = true as any;
                                  el.play().catch(() => { });
                                }
                              }}
                              className="w-full h-full object-contain"
                              autoPlay
                              muted
                              playsInline
                            />
                          </div>
                        </div>
                      )}

                    <p className="text-sm text-gray-500">
                      You can add or record a real video to make the chat feel
                      more personal and authentic.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Last Dialog Accordion */}
              <AccordionItem
                value="last-dialog"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {openAccordionId !== "last-dialog" && lastDialogVideo ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        2
                      </div>
                    )}
                    <span>Last Dialog</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4">
                    {lastDialogVideo ? (
                      <div className="mt-4">
                        <VideoUploader
                          currentVideo={lastDialogVideo}
                          fileName={shortenUrl(lastDialogFileName)}
                          onVideoUpload={handleLastVideoUpload}
                          onVideoDelete={handleLastVideoDelete}
                          onVideoPreview={handleLastVideoPreview}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <button
                            onClick={() => startRecording("last")}
                            className="w-full h-14 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                          >
                            <svg
                              className="w-6 h-6 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-sm">Record</span>
                          </button>
                        </div>
                        <div className="col-span-1">
                          <VideoUploader
                            currentVideo={lastDialogVideo}
                            fileName={shortenUrl(lastDialogFileName)}
                            onVideoUpload={handleLastVideoUpload}
                            onVideoDelete={handleLastVideoDelete}
                            onVideoPreview={handleLastVideoPreview}
                          />
                        </div>
                      </div>
                    )}

                    {isUploading && uploadingKind === "last" && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                        Uploading video...
                      </div>
                    )}

                    {!isUploading &&
                      isRecording &&
                      recordingKind === "last" && (
                        <div className="mt-4 border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 text-sm flex items-center justify-between">
                            <span className="text-gray-700">
                              Recording...{" "}
                              {isListeningStop &&
                                '(listening for "stop recording")'}
                            </span>
                            <button
                              onClick={stopRecording}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Stop
                            </button>
                          </div>
                          <div className="aspect-video bg-black">
                            <video
                              ref={(el) => {
                                previewVideoRef.current = el;
                                if (el && mediaStreamRef.current) {
                                  try {
                                    (el as any).srcObject =
                                      mediaStreamRef.current;
                                  } catch (_) {
                                    el.src = URL.createObjectURL(
                                      mediaStreamRef.current as any
                                    );
                                  }
                                  el.muted = true;
                                  el.playsInline = true as any;
                                  el.play().catch(() => { });
                                }
                              }}
                              className="w-full h-full object-contain"
                              autoPlay
                              muted
                              playsInline
                            />
                          </div>
                        </div>
                      )}

                    <p className="text-sm text-gray-500">
                      You can add or record a real video to make the chat feel
                      more personal and authentic.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {showPreview && (
          <div
            className={`${selectedDevice === "web"
              ? "col-span-1 md:col-span-9 hidden md:block"
              : selectedDevice === "tablet"
                ? "col-span-1"
                : "col-span-1"
              }`}
          >
            {preview}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog
        open={previewModalOpen}
        onOpenChange={(open) => {
          setPreviewModalOpen(open);
          if (!open) {
            // Reset validation states when modal closes
            setIsValidAspectRatio(null);
            setIsValidFileSize(null);
            setPreviewVideoUrl(null);
            setPreviewVideoFile(null);
            // Clean up blob URL (only if it's a blob URL, not a regular URL)
            if (previewVideoUrlRef.current && previewVideoUrlRef.current.startsWith('blob:')) {
              URL.revokeObjectURL(previewVideoUrlRef.current);
            }
            previewVideoUrlRef.current = null;
          }
        }}
      >
        <DialogContent className="max-w-md p-0">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="bg-gray-100 rounded-lg h-[500px] relative overflow-hidden">
              {previewVideoUrl ? (
                <video
                  ref={previewVideoElementRef}
                  src={previewVideoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center absolute inset-0">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div className={`text-sm ${isValidFileSize === false ? 'text-red-500' : isValidFileSize === true ? 'text-green-600' : 'text-gray-600'}`}>
                Under 100Mb {isValidFileSize === false && '(Invalid)'}
              </div>
              <div className={`text-sm ${isValidAspectRatio === false ? 'text-red-500' : isValidAspectRatio === true ? 'text-green-600' : 'text-gray-600'}`}>
                9:16 Ratio {isValidAspectRatio === false && '(Invalid)'}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogsStep;
