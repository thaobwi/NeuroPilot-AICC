// DashboardPage.tsx
import React, {
  useContext,
  useEffect,
  useState,
  lazy,
  Suspense,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { AppContext } from "../App";
import { NarratorRole } from "../types";
import { NARRATORS, LOCALIZED_CONTENT, STORY_CONTENT } from "../constants";

import InterviewPractice from "../components/features/jobseeker/InterviewPractice";
import SessionHistory from "../components/features/jobseeker/SessionHistory";
import SpeakerIcon from "../components/icons/SpeakerIcon";
import ParentGuidance from "../components/features/parent/ParentGuidance";
import StoryPlayer from "../components/features/common/StoryPlayer";
import PracticeIcon from "../components/icons/PracticeIcon";
import HistoryIcon from "../components/icons/HistoryIcon";
import Tooltip from "../components/Tooltip";
import VolunteerPractice from "../components/features/volunteer/VolunteerPractice";

const EmployerGuide = lazy(
  () => import("../components/features/employer/EmployerGuide"),
);

// step mapping: 1 = choose module, 2 = answer, 3 = waiting/feedback
type PracticeStep = 1 | 2 | 3;

const DashboardPage: React.FC = () => {
  const {
    narratorRole,
    mode,
    language,
    setNarratorDialogue,
    setNarratorState,
  } = useContext(AppContext);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"practice" | "history">("practice");
  const [showMascot, setShowMascot] = useState(true);
  const [practiceStep, setPracticeStep] = useState<PracticeStep>(1);

  useEffect(() => {
    if (!narratorRole) {
      navigate("/");
      return;
    }
    if (!mode) {
      navigate("/mode-selection");
      return;
    }
    if (mode === "practice") {
      const narrator = NARRATORS[narratorRole];
      setNarratorDialogue(narrator.intro[language]);
      setNarratorState("intro");
      const t = setTimeout(() => setNarratorState("idle"), 4000);
      return () => clearTimeout(t);
    }
  }, [narratorRole, mode, navigate, language, setNarratorDialogue, setNarratorState]);

  if (!narratorRole || !mode) return null;

  const narrator = NARRATORS[narratorRole];

  const steps = useMemo(
    () => [
      { id: 1 as PracticeStep, label: "Step 1", title: "Choose practice type" },
      { id: 2 as PracticeStep, label: "Step 2", title: "Answer" },
      { id: 3 as PracticeStep, label: "Step 3", title: "Review feedback" },
    ],
    [],
  );

  const currentStepMeta =
    steps.find((s) => s.id === practiceStep) ?? steps[0];
  const progressPercent = (practiceStep / steps.length) * 100;

  const completionMessage =
    practiceStep === 1
      ? "Pick your practice mode to get started."
      : practiceStep === 2
      ? "Nice work—strong answers now will pay off in the feedback."
      : "You’re almost done—use this feedback to sharpen your next round.";

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language === "en" ? "en-US" : "vi-VN";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } else {
      alert("Sorry, your browser doesn't support text-to-speech.");
    }
  };

  const renderPracticeContent = () => {
    switch (narratorRole) {
      case NarratorRole.Jobseeker:
        return (
          <div className="space-y-6">
            {/* Practice / History as rectangular cards on the right */}
            <div role="tablist" aria-label="Practice options" className="mb-2">
              <nav className="flex flex-wrap gap-4 justify-end">
                <button
                  role="tab"
                  id="practice-tab"
                  aria-controls="practice-panel"
                  aria-selected={activeTab === "practice"}
                  onClick={() => {
                    setActiveTab("practice");
                    setPracticeStep(1);
                  }}
                  className={`flex items-center justify-between text-left w-full max-w-sm px-5 py-3 rounded-xl font-semibold
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
                              transition-colors shadow-sm
                              ${
                                activeTab === "practice"
                                  ? "bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white shadow-lg border-0"
                                  : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50"
                              }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <PracticeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm">
                        {LOCALIZED_CONTENT.practice[language]}
                      </div>
                      <div
                        className={`mt-1 text-xs ${
                          activeTab === "practice"
                            ? "text-slate-100/90"
                            : "text-slate-500"
                        }`}
                      >
                        Quick mock interview with Pathfinder.
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  role="tab"
                  id="history-tab"
                  aria-controls="history-panel"
                  aria-selected={activeTab === "history"}
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center justify-between text-left w-full max-w-sm px-5 py-3 rounded-xl font-semibold
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
                              transition-colors shadow-sm
                              ${
                                activeTab === "history"
                                  ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg border-0"
                                  : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50"
                              }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <HistoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm">
                        {LOCALIZED_CONTENT.history[language]}
                      </div>
                      <div
                        className={`mt-1 text-xs ${
                          activeTab === "history"
                            ? "text-slate-100/90"
                            : "text-slate-500"
                        }`}
                      >
                        Browse past sessions and feedback.
                      </div>
                    </div>
                  </div>
                </button>
              </nav>
            </div>

            {/* Panels */}
            {activeTab === "practice" && (
              <div
                id="practice-panel"
                role="tabpanel"
                tabIndex={0}
                aria-labelledby="practice-tab"
                className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm"
              >
                <InterviewPractice onStepChange={setPracticeStep} />
              </div>
            )}

            {activeTab === "history" && (
              <div
                id="history-panel"
                role="tabpanel"
                tabIndex={0}
                aria-labelledby="history-tab"
                className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm"
              >
                <SessionHistory />
              </div>
            )}
          </div>
        );

      case NarratorRole.Employer:
        return (
          <Suspense fallback={<div className="p-6">Loading…</div>}>
            <EmployerGuide />
          </Suspense>
        );

      case NarratorRole.CareGiver:
        return <ParentGuidance />;

      case NarratorRole.Volunteer:
        return <VolunteerPractice />;

      default:
        return <p className="text-slate-900">No content available for this role.</p>;
    }
  };

  const renderContent = () => {
    if (mode === "practice") return renderPracticeContent();
    if (mode === "story") {
      const story = STORY_CONTENT[narratorRole];
      return <StoryPlayer story={story} />;
    }
    return null;
  };

  const showJobseekerProgressBar =
    mode === "practice" &&
    narratorRole === NarratorRole.Jobseeker &&
    activeTab === "practice";

  return (
    <Layout>
      <div className="space-y-8">
        {/* Top bar: mascot toggle + progress bar */}
        {mode === "practice" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMascot((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {showMascot ? "Hide Pathfinder" : "Show Pathfinder"}
              </button>
            </div>

            {showMascot && (
              <header className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center gap-5">
                <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                  <span aria-hidden className="absolute -inset-1 rounded-full ring-2 ring-white/30" />
                  <div className="w-full h-full rounded-full bg-white overflow-hidden">
                    <img
                      src={narrator.avatars.neutral}
                      alt={narrator.name[language]}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    Welcome!
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-lg text-white/90">
                      Your{" "}
                      <span className="font-bold underline decoration-blue-300">
                        {narrator.name[language]}
                      </span>{" "}
                      is here to guide you.
                    </p>
                    <Tooltip tip="Read introduction aloud">
                      <button
                        onClick={() => handleSpeak(narrator.intro[language])}
                        className="pointer-events-auto p-1 rounded-full text-white hover:bg-white/15
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        aria-label="Read introduction aloud"
                      >
                        <SpeakerIcon className="w-6 h-6" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </header>
            )}

            {/* Progress bar: more motivating / "completion" feel */}
            {showJobseekerProgressBar && (
              <section
                aria-label="Interview practice progress"
                className="space-y-3 rounded-2xl bg-slate-50/80 p-4 border border-slate-200"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-2 py-0.5 text-[0.65rem] uppercase tracking-wide">
                      Interview journey
                    </span>
                    <span>
                      Step {practiceStep} of {steps.length}
                    </span>
                  </div>
                  <span className="text-[0.7rem] text-slate-500 line-clamp-1">
                    {completionMessage}
                  </span>
                </div>

                <div className="relative mt-1 h-3 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-1 flex justify-between text-[0.7rem] text-slate-500">
                  {steps.map((step) => {
                    const isActive = step.id === practiceStep;
                    const isCompleted = step.id < practiceStep;
                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] border
                            ${
                              isCompleted
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : isActive
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-400 border-slate-300"
                            }`}
                        >
                          {isCompleted ? "✓" : step.id}
                        </div>
                        <span
                          className={`${
                            isActive
                              ? "text-slate-900 font-semibold"
                              : "text-slate-500"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Content */}
        <div>{renderContent()}</div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
