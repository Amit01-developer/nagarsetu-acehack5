import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MapPin,
  Navigation,
  Paperclip,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { chatWithAI, categorizeIssue } from '../../api/aiApi';
import { createIssue, getIssue, getIssues, submitFeedback } from '../../api/issueApi';
import { Issue, IssueCategory, ISSUE_STATUSES } from '../../types/issue';

type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

type ReportStep = 'category' | 'description' | 'location' | 'address' | 'photo' | 'confirm';
type Intent = 'report' | 'track' | 'feedback' | 'general';

interface DraftIssue {
  category?: IssueCategory;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

const MAX_IMAGES = 5;

const QUICK_ACTIONS = [
  { id: 'report', label: 'Report an Issue' },
  { id: 'track', label: 'Track Complaint' },
];

const keywordCategoryMap: { category: IssueCategory; keywords: RegExp[] }[] = [
  { category: 'garbage', keywords: [/garbage/, /trash/, /waste/, /sanitation/, /dump/, /kooda/, /dirty/] },
  { category: 'pothole', keywords: [/pothole/, /road/, /pit/, /crack/, /damage/, /broken road/, /road hole/] },
  { category: 'street_light', keywords: [/street ?light/, /lamp/, /light not working/, /dark street/] },
  { category: 'water_leak', keywords: [/water/, /leak/, /pipe/, /supply/, /no water/, /low pressure/] },
  { category: 'drainage', keywords: [/drain/, /sewage/, /overflow/, /gutter/, /manhole/, /sewer/] },
];

const detectCategoryFromText = (text: string): IssueCategory | undefined => {
  const lower = text.toLowerCase();
  for (const item of keywordCategoryMap) {
    if (item.keywords.some((k) => k.test(lower))) {
      return item.category;
    }
  }
  return undefined;
};

const detectIntent = (text: string): Intent => {
  const lower = text.toLowerCase();
  if (/(report|complaint|issue|pothole|garbage|street ?light|drain|sewage|water)/.test(lower)) return 'report';
  if (/(track|status|complaint status|check complaint|my complaint)/.test(lower)) return 'track';
  if (/(feedback|rating|review)/.test(lower)) return 'feedback';
  return 'general';
};

const isLikelyHindi = (text: string) => /[\u0900-\u097F]/.test(text.trim());

const formatIssueSummary = (issue: Issue) => {
  const statusLabel = ISSUE_STATUSES.find((s) => s.value === issue.status)?.label || issue.status;
  const dept = issue.assignedTo?.contractor?.company || issue.assignedTo?.profile?.name || 'Municipal team';
  const eta =
    issue.status === 'pending'
      ? 'Expected: 48-72 hrs after verification.'
      : issue.status === 'verified'
        ? 'Expected: 48 hrs to assign and start work.'
        : issue.status === 'assigned'
          ? 'Expected: Work start within 24 hrs.'
          : issue.status === 'in_progress'
            ? 'Expected: Completion soon. You will be notified.'
            : issue.status === 'completed'
              ? 'Waiting for municipal approval.'
              : issue.status === 'resolved'
                ? 'Resolved. Please share feedback.'
                : 'Please contact support for details.';

  return `ID: ${issue._id}\nCategory: ${issue.category.replace('_', ' ')}\nStatus: ${statusLabel}\nAssigned: ${dept}\n${eta}`;
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm your NagarSetu City Assistant. I can help you report issues and track complaints.\nPick a quick action or type your request.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFlow, setIsProcessingFlow] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [canUseSTT, setCanUseSTT] = useState(false);
  const [canUseTTS, setCanUseTTS] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeFlow, setActiveFlow] = useState<Intent>('general');
  const [reportStep, setReportStep] = useState<ReportStep>('category');
  const [draftIssue, setDraftIssue] = useState<DraftIssue>({});
  const [draftImages, setDraftImages] = useState<File[]>([]);
  const [draftPreviews, setDraftPreviews] = useState<string[]>([]);
  const [photoOptOut, setPhotoOptOut] = useState(false);
  const [pendingFeedbackIssue, setPendingFeedbackIssue] = useState<Issue | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (chatRef.current && !chatRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognition: any = new SpeechRecognitionClass();
      recognition.lang = 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };
      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        setInterimTranscript('');
        toast.error('Could not access microphone');
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };
      recognition.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';

        Array.from(event.results).forEach((result: any) => {
          const text = result[0].transcript.trim();
          if (result.isFinal) {
            finalText += `${text} `;
          } else {
            interimText += `${text} `;
          }
        });

        if (finalText.trim()) {
          setInput((prev) => {
            const next = `${prev ? `${prev} ` : ''}${finalText.trim()}`;
            inputRef.current = next;
            return next;
          });
        }
        setInterimTranscript(interimText.trim());

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          stopListening(true);
        }, 3000);
      };

      recognitionRef.current = recognition;
      setCanUseSTT(true);
    }

    if ('speechSynthesis' in window) {
      setCanUseTTS(true);
    } else {
      setAutoSpeak(false);
    }

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current?.abort?.();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const toPlainText = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/[_]+/g, '')
      .trim();

  const speakText = (text: string, showWarning = false) => {
    if (!canUseTTS || typeof window === 'undefined') {
      if (showWarning) {
        toast.error('Voice playback not supported');
      }
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const clean = toPlainText(text);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = isLikelyHindi(clean) ? 'hi-IN' : navigator.language || 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (!canUseTTS || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const addMessage = (role: MessageRole, content: string) => {
    const msg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    if (role === 'assistant' && autoSpeak && canUseTTS) {
      speakText(content);
    }
  };

  const resetReportDraft = () => {
    setDraftIssue({});
    setDraftImages([]);
    setDraftPreviews([]);
    setPhotoOptOut(false);
    setReportStep('category');
    setActiveFlow('general');
  };

  const startReportFlow = async (userText?: string) => {
    setActiveFlow('report');
    setReportStep('category');
    const detected = userText ? detectCategoryFromText(userText) : undefined;
    const baseIntro =
      "Sure, let's log your civic issue. I need: category, a crisp description, GPS coordinates (tap the pin), nearest landmark/house-no, and at least one photo for faster action.";
    if (detected) {
      setDraftIssue((prev) => ({ ...prev, category: detected }));
      setReportStep('description');
      addMessage(
        'assistant',
        `${baseIntro}\nI think this is ${detected.replace('_', ' ')}. Please describe the issue in 1-2 sentences.`
      );
      return;
    }

    addMessage(
      'assistant',
      `${baseIntro}\nWhat type of issue is it? Options: sanitation/garbage, road/pothole, streetlight, water supply, drainage, other.`
    );
  };

  const handleReportFlow = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (reportStep === 'category') {
      const localCategory = detectCategoryFromText(trimmed);
      if (localCategory) {
        setDraftIssue((prev) => ({ ...prev, category: localCategory }));
        setReportStep('description');
        addMessage(
          'assistant',
          `Noted ${localCategory.replace('_', ' ')}. Please describe what is wrong in 1-2 sentences.`
        );
        return;
      }

      try {
        setIsProcessingFlow(true);
        const aiGuess = await categorizeIssue(trimmed);
        const guessed = aiGuess.data.category as IssueCategory;
        setDraftIssue((prev) => ({ ...prev, category: guessed }));
        setReportStep('description');
        addMessage(
          'assistant',
          `I will log this as ${guessed.replace('_', ' ')}. Now describe the issue in 1-2 sentences.`
        );
      } catch (err) {
        addMessage(
          'assistant',
          'I could not decide the category. Please choose: garbage, road/pothole, streetlight, water supply, drainage, or other.'
        );
      } finally {
        setIsProcessingFlow(false);
      }
      return;
    }

    if (reportStep === 'description') {
      setDraftIssue((prev) => ({ ...prev, description: trimmed }));
      setReportStep('location');
      addMessage(
        'assistant',
        'Share the exact location: tap the pin icon to auto-fill GPS OR type "lat,lng" (e.g., 12.97,77.59). Accurate GPS helps route it to the right ward.'
      );
      return;
    }

    if (reportStep === 'location') {
      const match = trimmed.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          setDraftIssue((prev) => ({ ...prev, latitude: lat, longitude: lng }));
          setReportStep('address');
          addMessage(
            'assistant',
            'Location saved. Please add nearest landmark/house-no/building or cross street. Type "none" if there is truly no landmark.'
          );
          return;
        }
      }
      addMessage(
        'assistant',
        'I could not read the location. Please share "latitude, longitude" or tap the pin icon to allow GPS.'
      );
      return;
    }

    if (reportStep === 'address') {
      if (trimmed.toLowerCase() !== 'none' && trimmed.toLowerCase() !== 'skip') {
        setDraftIssue((prev) => ({ ...prev, address: trimmed }));
      } else {
        setDraftIssue((prev) => ({ ...prev, address: 'Landmark not provided' }));
      }
      setReportStep('photo');
      addMessage(
        'assistant',
        'Add at least one photo of the issue (close-up + wider view). Use the clip button to attach. If you cannot add a photo, type "no photo".'
      );
      return;
    }

    if (reportStep === 'photo') {
      const lower = trimmed.toLowerCase();
      if (lower === 'skip' || lower === 'no' || lower === 'nah' || lower === 'no photo') {
        setPhotoOptOut(true);
        setReportStep('confirm');
        addMessage(
          'assistant',
          'Ready to submit. Reply "submit" to file the complaint or "cancel" to stop.'
        );
        return;
      }
      addMessage(
        'assistant',
        'Use the clip button to attach images (up to 5). Provide at least one photo, or type "no photo" if truly unavailable.'
      );
      return;
    }

    if (reportStep === 'confirm') {
      const lower = trimmed.toLowerCase();
      if (lower.includes('submit') || lower === 'yes' || lower === 'ok') {
        await submitComplaint();
        return;
      }
      if (lower.includes('cancel')) {
        resetReportDraft();
        addMessage('assistant', 'Cancelled the complaint draft. How else can I help?');
        return;
      }
      addMessage('assistant', 'Reply "submit" to file the complaint or "cancel" to stop.');
    }
  };

  const submitComplaint = async () => {
    if (!draftIssue.category || !draftIssue.description || !draftIssue.latitude || !draftIssue.longitude) {
      addMessage(
        'assistant',
        'I still need category, description, and location to submit. Please provide the missing details.'
      );
      return;
    }

    if (!draftIssue.address || draftIssue.address === 'Landmark not provided') {
      addMessage(
        'assistant',
        'Please add the nearest landmark, building name, or street reference so the crew can find it. Reply with the landmark or type "none" if truly unavailable.'
      );
      setReportStep('address');
      return;
    }

    if (draftImages.length === 0 && !photoOptOut) {
      addMessage(
        'assistant',
        'Please attach at least one clear photo (close-up + context). If you truly cannot add a photo, type "no photo".'
      );
      setReportStep('photo');
      return;
    }

    try {
      setIsProcessingFlow(true);
      const response = await createIssue({
        category: draftIssue.category,
        description: draftIssue.description,
        latitude: draftIssue.latitude,
        longitude: draftIssue.longitude,
        address: draftIssue.address,
        images: draftImages,
      });

      const issue = response.data.issue;
      addMessage(
        'assistant',
        `Complaint submitted! ID: ${issue._id}\nStatus: Pending verification\nYou will earn 10 points after verification.`
      );
      resetReportDraft();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Could not submit complaint. Please try again.';
      addMessage('assistant', msg);
    } finally {
      setIsProcessingFlow(false);
    }
  };

  const handleTrackIntent = async (text?: string) => {
    const idMatch = text?.match(/[a-f0-9]{24}/i);
    try {
      setIsProcessingFlow(true);
      if (idMatch) {
        const issueRes = await getIssue(idMatch[0]);
        addMessage('assistant', formatIssueSummary(issueRes.data.issue));
      } else {
        const list = await getIssues({ page: 1, limit: 3, sortBy: 'createdAt', order: 'desc' });
        const issues = list.data.issues;
        if (!issues.length) {
          addMessage('assistant', 'No complaints found. You can start a new report.');
          return;
        }
        const summaries = issues.map((i) => formatIssueSummary(i)).join('\n\n');
        addMessage('assistant', `Here are your latest complaints:\n\n${summaries}`);

        const resolved = issues.find((i) => i.status === 'resolved');
        if (resolved) {
          setPendingFeedbackIssue(resolved);
          setActiveFlow('feedback');
          addMessage(
            'assistant',
            `Your complaint ${resolved._id} is resolved. Please rate it 1-5 to share feedback.`
          );
        }
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Could not fetch complaint status. Please log in and try again.';
      addMessage('assistant', msg);
    } finally {
      setIsProcessingFlow(false);
    }
  };

  const handleFeedbackFlow = async (text: string) => {
    const ratingMatch = text.match(/([1-5])/);
    if (!ratingMatch) {
      addMessage('assistant', 'Please rate between 1 and 5 stars.');
      return;
    }
    const rating = parseInt(ratingMatch[1], 10);
    const idInText = text.match(/[a-f0-9]{24}/i)?.[0];
    const complaintId = pendingFeedbackIssue?._id || idInText;
    if (!complaintId) {
      addMessage('assistant', 'Tell me which complaint to rate. Example: "Feedback for <ID> is 5 stars."');
      return;
    }

    const comment = text.replace(ratingMatch[1], '').replace(complaintId, '').trim();

    try {
      setIsProcessingFlow(true);
      await submitFeedback({
        complaintId,
        qualityRating: rating,
        speedRating: rating,
        rating,
        comment: comment || undefined,
      });
      addMessage(
        'assistant',
        `Thanks! Submitted ${rating} stars for complaint ${complaintId}${comment ? ` with note: ${comment}` : ''}.`
      );
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Could not save feedback. Please try again.';
      addMessage('assistant', msg);
    } finally {
      setPendingFeedbackIssue(null);
      setActiveFlow('general');
      setIsProcessingFlow(false);
    }
  };

  const handleSendManual = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    inputRef.current = '';

    const intent = activeFlow === 'report' ? 'report' : activeFlow === 'feedback' ? 'feedback' : detectIntent(trimmed);

    if (intent === 'report') {
      await handleReportFlow(trimmed);
      return;
    }

    if (intent === 'track') {
      await handleTrackIntent(trimmed);
      return;
    }

    if (intent === 'feedback') {
      await handleFeedbackFlow(trimmed);
      return;
    }

    await fallbackToAI(trimmed);
  };

  const fallbackToAI = async (text: string) => {
    try {
      setIsLoading(true);
      const response = await chatWithAI(text);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      if (autoSpeak && canUseTTS) {
        speakText(assistantMessage.content);
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to get response');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I apologize, but I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const stopListening = (autoSubmit = false) => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    recognitionRef.current.abort?.();
    setIsListening(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (autoSubmit) {
      const textToSend = `${inputRef.current} ${interimTranscript}`.trim();
      setInterimTranscript('');
      if (textToSend) {
        handleSendManual(textToSend);
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech-to-text not supported in this browser');
      return;
    }

    if (isListening) {
      stopListening(true);
    } else {
      try {
        recognitionRef.current.start();
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } catch (err) {
        toast.error('Unable to start listening');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendManual(input);
    }
  };

  const handleQuickAction = (id: string) => {
    if (id === 'report') {
      startReportFlow();
      return;
    }
    if (id === 'track') {
      setActiveFlow('track');
      handleTrackIntent();
      return;
    }
  };

  const handleAttachImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (draftImages.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const valid = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setDraftImages((prev) => [...prev, ...valid]);

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDraftPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (reportStep === 'photo') {
      setPhotoOptOut(false);
      setReportStep('confirm');
      addMessage(
        'assistant',
        'Photo added. Reply "submit" to file the complaint or "cancel" to stop.'
      );
    }
    // allow selecting the same file again later
    e.target.value = '';
  };

  const removeDraftImage = (index: number) => {
    setDraftImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setPhotoOptOut(false);
      return next;
    });
    setDraftPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleShareLocation = () => {
    if (reportStep !== 'location' && reportStep !== 'address' && activeFlow !== 'report') {
      toast.error('Start a report first to attach location.');
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device');
      return;
    }

    addMessage('assistant', 'Requesting your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraftIssue((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        if (reportStep === 'location') {
          setReportStep('address');
          addMessage(
            'assistant',
            'Location saved from GPS. Please add nearest landmark/house-no/building or cross street. Type "none" only if there is truly no landmark.'
          );
        } else {
          addMessage('assistant', 'Location updated.');
        }
      },
      () => {
        toast.error('Could not get location. Please type coordinates instead.');
      }
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-primary-600 text-white px-5 py-3 rounded-full shadow-xl ring-2 ring-primary-100 hover:bg-primary-700 transition-all transform hover:-translate-y-1 hover:shadow-2xl ${
          isOpen ? 'hidden' : 'flex items-center gap-2'
        }`}
        aria-label="Open AI Chat"
      >
        <Bot className="w-6 h-6" />
        <span className="text-sm font-semibold">Chat</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
      </button>

      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[540px] bg-gradient-to-b from-white via-white to-slate-50 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200/80 animate-pop-in transition-all duration-300"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">NagarSetu Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoSpeak((prev) => !prev)}
                disabled={!canUseTTS}
                className="p-1 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                aria-label="Toggle voice playback"
                title={
                  canUseTTS
                    ? autoSpeak
                      ? 'Mute voice replies'
                      : 'Enable voice replies'
                    : 'Voice playback not supported'
                }
              >
                {autoSpeak && canUseTTS ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary-700 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.id}
                  onClick={() => handleQuickAction(qa.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-full hover:border-primary-500 hover:text-primary-600 hover:shadow-sm transition-all"
                >
                  {qa.id === 'report' && <Sparkles className="w-4 h-4" />}
                  {qa.id === 'track' && <Navigation className="w-4 h-4" />}
                  {qa.label}
                </button>
              ))}
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' ? 'bg-gray-200' : 'bg-primary-100'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary-600" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 whitespace-pre-wrap text-left">
                      {message.content}
                    </div>
                    {message.role === 'assistant' && canUseTTS && (
                      <button
                        onClick={() =>
                          isSpeaking ? stopSpeech() : speakText(message.content, true)
                        }
                        className="text-primary-600 hover:text-primary-700"
                        title={isSpeaking ? 'Stop voice' : 'Play response'}
                        aria-label={isSpeaking ? 'Stop voice' : 'Play response'}
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(isLoading || isProcessingFlow) && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200 space-y-2">
            {draftPreviews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {draftPreviews.map((src, idx) => (
                  <div key={idx} className="relative w-16 h-16 flex-shrink-0">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeDraftImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask or reply..."
                className="flex-1 h-10 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm shadow-inner"
                disabled={isLoading}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleAttachImages}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg border border-gray-200 hover:border-primary-500 hover:text-primary-600 transition-all hover:-translate-y-0.5"
                aria-label="Attach photo"
                title="Attach photo"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleShareLocation}
                className="p-2 rounded-lg border border-gray-200 hover:border-primary-500 hover:text-primary-600 transition-all hover:-translate-y-0.5"
                aria-label="Share location"
                title="Share current location"
              >
                <MapPin className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={toggleListening}
                disabled={!canUseSTT || isLoading}
                className={`p-2 rounded-lg border border-gray-200 hover:border-primary-500 hover:text-primary-600 transition-all hover:-translate-y-0.5 ${
                  isListening ? 'bg-primary-50 text-primary-700 border-primary-300' : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Toggle voice input"
                title={
                  canUseSTT
                    ? isListening
                      ? 'Stop listening and send'
                      : 'Talk instead of typing'
                    : 'Voice input not supported'
                }
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => handleSendManual(input)}
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 flex items-center justify-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 shadow"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {interimTranscript && (
              <p className="text-xs text-primary-600 italic">
                Listening... {interimTranscript}
              </p>
            )}
            {!canUseSTT && (
              <p className="text-xs text-gray-500">
                Voice input is not supported in this browser. Try Chrome or Edge on desktop/mobile.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
