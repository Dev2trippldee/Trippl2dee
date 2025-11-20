"use client";

import React, { useState, useEffect, useRef } from "react";
import type Player from "video.js/dist/types/player";

// Global video manager to ensure only one video plays at a time
class VideoManager {
  private players: Set<{ pause: () => void; play: () => Promise<void>; isPlaying: () => boolean }> = new Set();
  private currentPlayer: { pause: () => void; play: () => Promise<void>; isPlaying: () => boolean } | null = null;

  register(player: { pause: () => void; play: () => Promise<void>; isPlaying: () => boolean }) {
    this.players.add(player);
  }

  unregister(player: { pause: () => void; play: () => Promise<void>; isPlaying: () => boolean }) {
    this.players.delete(player);
    if (this.currentPlayer === player) {
      this.currentPlayer = null;
    }
  }

  onPlay(player: { pause: () => void; play: () => Promise<void>; isPlaying: () => boolean }) {
    // Pause all other players
    this.players.forEach((p) => {
      if (p !== player && p.isPlaying()) {
        p.pause();
      }
    });
    this.currentPlayer = player;
  }
}

const videoManager = new VideoManager();

interface VideoJsPlayerProps {
  src: string;
  className?: string;
  maxHeight?: string;
  autoPlay?: boolean; // Auto-play when video comes into viewport
}

export function VideoJsPlayer({ src, className = "", maxHeight = "600px", autoPlay = false }: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [useNativePlayer, setUseNativePlayer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerIdRef = useRef<{ pause: () => void; isPlaying: () => boolean; play: () => Promise<void> } | null>(null);
  const wasPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!src) {
      return;
    }

    // Reset error state when src changes
    setError(null);

    const loadVideoJs = async () => {
      try {
        const videojs = (await import("video.js")).default;

        // Check if stylesheet already exists
        let link = document.querySelector('link[href*="video-js"]') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement("link") as HTMLLinkElement;
          link.rel = "stylesheet";
          link.href =
            "https://cdnjs.cloudflare.com/ajax/libs/video.js/8.10.0/video-js.min.css";
          document.head.appendChild(link);
        }

        if (!playerRef.current && videoRef.current) {
          // Detect video type from URL
          const videoType = src.endsWith(".mp4") ? "video/mp4" : 
                          src.endsWith(".webm") ? "video/webm" :
                          src.endsWith(".ogg") ? "video/ogg" : "video/mp4";
          
          playerRef.current = videojs(videoRef.current, {
            controls: true,
            responsive: true,
            fluid: true,
            preload: "metadata",
            muted: autoPlay, // Mute for auto-play to work in browsers
            playbackRates: [0.5, 1, 1.5, 2],
            sources: [{
              src: src,
              type: videoType
            }],
            html5: {
              vhs: {
                overrideNative: false
              },
              nativeVideoTracks: true,
              nativeAudioTracks: true,
              nativeTextTracks: true
            }
          });
          
          playerRef.current.ready(() => {
            if (!playerRef.current) return;
            
            // Register player with video manager
            const playerControl = {
              pause: () => {
                if (playerRef.current && !playerRef.current.paused()) {
                  playerRef.current.pause();
                }
              },
              play: () => {
                const player = playerRef.current;
                if (player && player.paused()) {
                  const playPromise = player.play();
                  if (playPromise !== undefined) {
                    return playPromise.catch(() => {});
                  }
                }
                return Promise.resolve();
              },
              isPlaying: () => {
                return playerRef.current ? !playerRef.current.paused() : false;
              }
            };
            playerIdRef.current = playerControl;
            videoManager.register(playerControl);

            // Listen for play events
            playerRef.current.on("play", () => {
              wasPlayingRef.current = true;
              videoManager.onPlay(playerControl);
            });

            // Track when video is paused
            playerRef.current.on("pause", () => {
              wasPlayingRef.current = false;
            });
          });

          if (playerRef.current) {
            playerRef.current.on("error", () => {
              const playerError = playerRef.current?.error();
              if (playerError) {
                // If video.js fails, fallback to native player
                if (playerError.code === 4) {
                  setUseNativePlayer(true);
                  if (playerRef.current) {
                    try {
                      playerRef.current.dispose();
                    } catch {
                      // Error disposing player
                    }
                    playerRef.current = null;
                  }
                } else {
                  setError("Failed to load video");
                }
              }
            });

            playerRef.current.on("loadstart", () => {});
          }
        } else if (playerRef.current && src && !useNativePlayer) {
          // Update source if player already exists
          const videoType = src.endsWith(".mp4") ? "video/mp4" : 
                          src.endsWith(".webm") ? "video/webm" :
                          src.endsWith(".ogg") ? "video/ogg" : "video/mp4";
          playerRef.current.src({
            src: src,
            type: videoType
          });
        }
      } catch {
        setUseNativePlayer(true);
      }
    };

    if (!useNativePlayer) {
      loadVideoJs();
    }

    return () => {
      // Unregister from video manager
      if (playerIdRef.current) {
        videoManager.unregister(playerIdRef.current);
        playerIdRef.current = null;
      }
      
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch {
          // Error disposing player
        }
        playerRef.current = null;
      }
    };
  }, [src, useNativePlayer]);

  if (!src) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
        No video source
      </div>
    );
  }

  // Register/unregister native video player
  useEffect(() => {
    if (useNativePlayer && videoRef.current) {
      const video = videoRef.current;
      
      const playerControl = {
        pause: () => {
          if (video && !video.paused) {
            video.pause();
          }
        },
        play: () => {
          if (video && video.paused) {
            return video.play().catch(() => {});
          }
          return Promise.resolve();
        },
        isPlaying: () => {
          return video ? !video.paused : false;
        }
      };
      
      playerIdRef.current = playerControl;
      videoManager.register(playerControl);

      const handlePlay = () => {
        wasPlayingRef.current = true;
        videoManager.onPlay(playerControl);
      };

      const handlePause = () => {
        wasPlayingRef.current = false;
      };

      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        if (playerIdRef.current) {
          videoManager.unregister(playerIdRef.current);
          playerIdRef.current = null;
        }
      };
    }
  }, [useNativePlayer]);

  // Intersection Observer to pause/play based on viewport visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is in viewport
            if (autoPlay) {
              // Auto-play when coming into view (for recipes)
              if (playerIdRef.current && !playerIdRef.current.isPlaying()) {
                // Small delay to ensure video is ready
                setTimeout(() => {
                  if (playerIdRef.current && !playerIdRef.current.isPlaying()) {
                    playerIdRef.current.play().catch(() => {
                      // Auto-play may be blocked by browser, ignore error
                    });
                    wasPlayingRef.current = true;
                  }
                }, 100);
              }
            } else {
              // Resume if it was playing before (for posts)
              if (wasPlayingRef.current && playerIdRef.current) {
                playerIdRef.current.play().catch(() => {});
              }
            }
          } else {
            // Video is out of viewport - pause if playing
            if (playerIdRef.current && playerIdRef.current.isPlaying()) {
              wasPlayingRef.current = true;
              playerIdRef.current.pause();
            } else {
              wasPlayingRef.current = false;
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of video is visible
        rootMargin: "0px",
      }
    );

    observer.observe(container);

    // Check if video is already in viewport when component mounts (for auto-play)
    let timeoutId: NodeJS.Timeout | null = null;
    if (autoPlay) {
      const checkInitialVisibility = () => {
        const rect = container.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible && playerIdRef.current && !playerIdRef.current.isPlaying()) {
          setTimeout(() => {
            if (playerIdRef.current && !playerIdRef.current.isPlaying()) {
              playerIdRef.current.play().catch(() => {
                // Auto-play may be blocked by browser, ignore error
              });
              wasPlayingRef.current = true;
            }
          }, 500); // Wait a bit for video to load
        }
      };
      
      // Check after a short delay to allow video to initialize
      timeoutId = setTimeout(checkInitialVisibility, 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      observer.disconnect();
    };
  }, [useNativePlayer, autoPlay]);

  // Fallback to native HTML5 video player
  if (useNativePlayer) {
    return (
      <div ref={containerRef} className={`w-full h-full ${className}`}>
        <video 
          ref={videoRef}
          controls
          playsInline
          muted={autoPlay}
          preload="metadata"
          className={`w-full h-auto rounded-lg ${className}`}
          style={{ maxHeight }}
          onError={(e) => {
            const video = e.currentTarget;
            const error = video.error;
            if (error) {
              setError("Failed to load video. Please check the video URL.");
            }
          }}
          onLoadStart={() => {
            setError(null);
          }}
          onLoadedData={() => {
            setError(null);
          }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {error && (
          <div className="mt-2 text-sm text-red-500 text-center">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} data-vjs-player className={`w-full h-full ${className}`}>
      <video 
        ref={videoRef} 
        className="video-js vjs-big-play-centered"
        playsInline
        preload="metadata"
        style={{ maxHeight }}
      >
        <p className="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noopener noreferrer">
            supports HTML5 video
          </a>.
        </p>
      </video>
      {error && (
        <div className="mt-2 text-sm text-red-500 text-center">{error}</div>
      )}
    </div>
  );
}

