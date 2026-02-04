"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProgressBar from "@/app/components/ui/ProgressBar";
import MobileNav from "@/app/components/ui/MobileNav";
import { createClient } from "@/lib/supabase/client";
import styles from "./new-note.module.css";

export default function NewNotePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Clear existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // If content is empty, hide progress
    if (newContent.trim().length === 0) {
      setShowProgress(false);
      setProgress(0);
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
      return;
    }

    // Start timer: après 1s idle, barre apparaît
    typingTimerRef.current = setTimeout(() => {
      setShowProgress(true);
      setProgress(0);

      // Simulate progression 0% → 30% over 2 seconds
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 1.5; // 30% / 20 steps = 1.5% per step
        if (currentProgress >= 30) {
          currentProgress = 30;
          clearInterval(interval);
        }
        setProgress(currentProgress);
      }, 100); // 2000ms / 20 steps = 100ms per step

      progressTimerRef.current = interval as unknown as NodeJS.Timeout;
    }, 1000);
  };

  const handleSave = async () => {
    if (content.trim().length < 3) {
      alert("Le contenu doit contenir au moins 3 caractères");
      return;
    }

    setLoading(true);

    // Progress 30% → 70%
    setProgress(30);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 70) {
          clearInterval(progressInterval);
          return 70;
        }
        return prev + 2;
      });
    }, 50);

    try {
      // POST /api/notes
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      clearInterval(progressInterval);

      if (response.ok) {
        // Progress 70% → 100%
        let currentProgress = 70;
        const finalInterval = setInterval(() => {
          currentProgress += 3;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(finalInterval);

            // Redirect after reaching 100%
            setTimeout(() => {
              router.push("/dashboard");
            }, 300);
          }
          setProgress(currentProgress);
        }, 30);
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la sauvegarde");
        setLoading(false);
        setProgress(30);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Erreur lors de la sauvegarde");
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(30);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      startVoiceRecording();
    }
  };

  const startVoiceRecording = () => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "La reconnaissance vocale n'est pas supportée par votre navigateur",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setContent((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      if (event.error === "no-speech") {
        alert("Aucune parole détectée");
      } else if (event.error === "not-allowed") {
        alert("Veuillez autoriser l'accès au microphone");
      } else {
        alert("Erreur de reconnaissance vocale: " + event.error);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      <div className={styles.container}>
        {/* Desktop Header */}
        <header className={styles.header}>
          <nav className={styles.nav}>
            <Link href="/note/new" className={styles.navLink}>
              Nouvelle note
            </Link>
            <Link href="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
          </nav>
          <div className={styles.headerActions}>
            <button
              className={styles.backButton}
              onClick={() => router.push("/dashboard")}
              disabled={loading}
            >
              ← Retour
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={content.trim().length < 3 || loading}
            >
              Sauvegarder
            </button>
            <div className={styles.profile} ref={profileMenuRef}>
              <Image
                src="/svg/profile.svg"
                alt="Profile"
                width={32}
                height={32}
                className={styles.profileIcon}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: "pointer" }}
              />
              {showProfileMenu && (
                <div className={styles.profileMenu}>
                  <button
                    className={styles.profileMenuItem}
                    onClick={handleLogout}
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className={styles.mobileHeader}>
          <div className={styles.mobileHeaderLogo}>
            Cripan<mark>f</mark>
          </div>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={content.trim().length < 3 || loading}
          >
            Sauvegarder
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Nouvelle note</h1>
            <p className={styles.date}>📅 CRÉÉE LE {currentDate}</p>
          </div>

          <ProgressBar
            progress={Math.round(progress)}
            message="L'IA catégorise le contenu"
            subtitle="Analyse du contenu pour générer un titre et une catégorie ..."
            show={showProgress}
          />

          <textarea
            className={styles.textarea}
            placeholder="Je suis le premier milliardaire de ma famille"
            value={content}
            onChange={handleContentChange}
            disabled={loading}
          />
        </div>

        <button
          className={`${styles.micButton} ${isRecording ? styles.recording : ""}`}
          title={
            isRecording ? "Arrêter l'enregistrement" : "Enregistrement vocal"
          }
          disabled={loading}
          onClick={toggleVoiceRecording}
        >
          <Image
            src={isRecording ? "/svg/stop.svg" : "/svg/mic.svg"}
            alt={isRecording ? "Stop" : "Microphone"}
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </>
  );
}
