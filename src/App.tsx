/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  UserCheck, 
  Terminal as TerminalIcon, 
  Globe, 
  AlertTriangle, 
  Activity, 
  Mic, 
  MicOff,
  Search,
  Lock,
  Cpu,
  Fingerprint
} from 'lucide-react';

// --- Types ---
interface LogEntry {
  id: string;
  type: 'ai' | 'user' | 'system' | 'action';
  text: string;
  timestamp: string;
}

interface ThreatActor {
  id: string;
  name: string;
  origin: string;
  target: string;
  ip: string;
  ttp: string;
  status: 'ISOLATED' | 'CONTAINED' | 'MONITORING';
}

interface PlaybookStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'success' | 'error';
}

// --- Components ---

const BiometricLock = ({ onAuth }: { onAuth: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Awaiting Biometric Verification...');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsScanning(true);
          setStatus('Scanning Biometrics...');
          
          setTimeout(() => {
            setStatus('Identity Confirmed: ROOT ADMIN');
            setTimeout(() => {
              onAuth();
              // Stop stream
              stream.getTracks().forEach(track => track.stop());
            }, 1500);
          }, 4000);
        }
      } catch (err) {
        setStatus('ERROR: Biometric access denied. Manual override detected.');
        setTimeout(onAuth, 3000);
      }
    }
    startCamera();
  }, [onAuth]);

  return (
    <div id="login-screen" className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-cyan-400 mb-8 tracking-widest text-lg md:text-2xl font-bold uppercase text-center px-4"
      >
        U.S. Homeland Infrastructure Defense
      </motion.div>
      
      <div id="video-container" className="relative w-48 h-48 md:w-64 md:h-64 border-2 border-cyan-500 rounded-full overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.5)]">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover grayscale brightness-75 contrast-125"
        />
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-10"
        />
        <div className="absolute inset-0 border-[20px] border-black/20 rounded-full pointer-events-none" />
      </div>

      <div id="auth-text" className={`mt-8 text-xl tracking-widest ${status.includes('Confirmed') ? 'text-green-400' : 'text-cyan-400'}`}>
        {status}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          _
        </motion.span>
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [threats, setThreats] = useState<ThreatActor[]>([]);
  const [activePlaybookSteps, setActivePlaybookSteps] = useState<PlaybookStep[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const recognitionRef = useRef<any>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // --- Voice Utils ---
  const addLog = useCallback((text: string, type: LogEntry['type']) => {
    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        text,
        type,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    addLog(text, 'ai');
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    
    // Find a robotic-sounding female voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Female'))
    );
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.pitch = 0.85;
    utterance.rate = 1.05;
    
    synthRef.current.speak(utterance);
  }, [addLog]);

  // --- Logic Handlers ---
  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'analyze':
        speak("Initiating deep packet inspection and MITRE correlation. Crossing referenced proxy nodes...");
        setTimeout(() => {
          setThreats([
            {
              id: '1',
              name: 'APT-29 (Cozy Bear)',
              origin: 'Simulated State Actor',
              target: 'Federal Cloud Gateway',
              ip: '198.51.100.84',
              ttp: 'Credential Stuffing / MFA Bypass',
              status: 'ISOLATED'
            },
            {
              id: '2',
              name: 'FIN-7 Syndicate',
              origin: 'Eastern Europe (Extortion)',
              target: 'Financial Node Alpha',
              ip: '203.0.113.12',
              ttp: 'Zero-Day Exploit Attempt',
              status: 'CONTAINED'
            }
          ]);
          speak("Analysis complete. Two high-clearance threat actors identified. All Indicators of Compromise have been isolated.");
        }, 3000);
        break;
      
      case 'contain':
        speak("Executing Zero-Trust Isolation Protocols. Initiating defensive playbook Alpha.");
        
        const steps: PlaybookStep[] = [
          { id: '1', label: 'Identifying Compromised Nodes', status: 'active' },
          { id: '2', label: 'Updating Firewall Rules', status: 'pending' },
          { id: '3', label: 'Revoking Affected Credentials', status: 'pending' },
          { id: '4', label: 'Isolating Network Segment', status: 'pending' },
          { id: '5', label: 'Blocking Malicious IP Nodes', status: 'pending' }
        ];
        
        setActivePlaybookSteps(steps);
        
        // Execute steps sequentially
        const executeStep = (index: number) => {
          if (index >= steps.length) {
            speak("Containment sequence successful. Infrastructure is now in a secure offline state for forensic cleanup.");
            setTimeout(() => setActivePlaybookSteps([]), 5000);
            return;
          }

          setTimeout(() => {
            setActivePlaybookSteps(prev => prev.map((s, i) => {
              if (i === index) return { ...s, status: 'success' };
              if (i === index + 1) return { ...s, status: 'active' };
              return s;
            }));
            
            if (index === 1) addLog("PERIMETER HARDENED: IP 198.51.100.84 BLOCKED", "action");
            if (index === 4) addLog("PERIMETER HARDENED: IP 203.0.113.12 BLOCKED", "action");
            
            executeStep(index + 1);
          }, 1500);
        };

        executeStep(0);
        break;

      case 'report':
        speak("Compiling forensic incident report. Data integrity verified. Transmitting encrypted evidence package to CISA and FBI cyber divisions.");
        setTimeout(() => {
          addLog("SECURE TRANSMISSION COMPLETE: REPORT-ID-5501", "action");
          speak("Forensic report transmitted. Homeland security maintained. Good work, Commander.");
        }, 4000);
        break;
    }
  }, [speak, addLog]);

  const processCommand = useCallback((cmd: string) => {
    const command = cmd.toLowerCase();
    
    if (pendingAction) {
      if (command.includes('yes') || command.includes('execute') || command.includes('proceed')) {
        handleAction(pendingAction);
        setPendingAction(null);
      } else if (command.includes('no') || command.includes('abort') || command.includes('cancel')) {
        speak("Operation aborted. System standing by.");
        setPendingAction(null);
      } else {
        speak("I need confirmation to proceed. Yes or no?");
      }
      return;
    }

    if (command.includes('status')) {
      speak("System status is nominal. Melisa Core is tracking simulated global anomalies. Should I run a threat analysis?");
      setPendingAction('analyze');
    } else if (command.includes('analyze')) {
      handleAction('analyze');
    } else if (command.includes('contain') || command.includes('isolate') || command.includes('mitigate')) {
      speak("Attempting containment sequence. This will isolate affected nodes and block identified IPs. Confirm execution?");
      setPendingAction('contain');
    } else if (command.includes('report') || command.includes('forensic')) {
      handleAction('report');
    } else if (command.includes('hello') || command.includes('who are you')) {
      speak("I am Melisa. Your Level 3 robotic defensive intelligence AI. Licensed for U.S. Homeland Infrastructure Defense.");
    } else {
      speak("Command not recognized. Please specify: analyze threat, initiate containment, or generate forensic report.");
    }
  }, [pendingAction, handleAction, speak]);

  // --- Voice Initialization ---
  useEffect(() => {
    if (isAuthenticated) {
      // Setup Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => {
          if (isAuthenticated) {
            try { recognitionRef.current?.start(); } catch (e) {}
          }
        };
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          addLog(transcript, 'user');
          processCommand(transcript);
        };

        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Speech recognition error:", e);
        }
      }
      
      speak("Biometric authentication successful. Welcome back, Commander. Dashboard is live. I am monitoring global network nodes for intrusions.");
      addLog("SYSTEM: Melisa Core L3 Initialized. Language locked to EN-US.", "system");
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isAuthenticated, addLog, processCommand, speak]);

  // --- UI Utils ---
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isAuthenticated) {
    return <BiometricLock onAuth={() => setIsAuthenticated(true)} />;
  }

  return (
    <div id="dashboard" className="h-screen w-screen bg-[#020609] text-cyan-400 font-mono p-2 md:p-4 flex flex-col gap-2 md:gap-4 overflow-hidden select-none">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-500/50 pb-2 bg-gradient-to-r from-cyan-950/20 to-transparent gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 md:w-6 md:h-6" />
          <h1 className="text-sm md:text-xl font-bold tracking-tighter uppercase truncate">Melisa Mission Control // SOAR</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs">
          <div className="flex items-center gap-2 text-green-500">
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"
            />
            LINK: ACTIVE
          </div>
          <div className="text-cyan-500/50">SEC-LEVEL: OMEGA</div>
          <div className="text-cyan-500/50 uppercase">{new Date().toLocaleTimeString()}</div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_350px] gap-2 md:gap-4 overflow-y-auto lg:overflow-hidden pb-48 lg:pb-0 custom-scrollbar">
        {/* Sidebar: Status & Local Biometrics */}
        <aside className="flex flex-col gap-2 md:gap-4 h-fit lg:h-full">
          <section className="panel flex flex-col items-center bg-[#050c14]/90 border border-cyan-500/30 p-4 relative h-48 md:h-64 shrink-0">
            <div className="absolute top-0 left-0 bg-cyan-700/50 text-[10px] px-2 py-0.5 border-b border-r border-cyan-500 font-bold uppercase">Biometric Monitor</div>
            <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-cyan-500 rounded-full overflow-hidden mt-6 flex items-center justify-center bg-black/40">
              <UserCheck className="w-12 h-12 md:w-16 md:h-16 opacity-40 animate-pulse" />
            </div>
            <div className="mt-2 md:mt-4 text-center">
              <div className="text-green-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Root Admin Verified</div>
              <div className="text-[9px] text-cyan-500/50 mt-1 uppercase tracking-tighter">Homeland Clearance</div>
            </div>
          </section>

          <section className="panel flex-1 bg-[#050c14]/90 border border-cyan-500/30 p-4 relative min-h-[200px] lg:flex-1 lg:overflow-y-auto">
            <div className="absolute top-0 left-0 bg-cyan-700/50 text-[10px] px-2 py-0.5 border-b border-r border-cyan-500 font-bold uppercase">System Health</div>
            <div className="mt-4 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]"><span>CPU LOAD</span><span>14%</span></div>
                <div className="h-1 bg-cyan-900/50 rounded-full overflow-hidden">
                  <motion.div animate={{ width: '14%' }} className="h-full bg-cyan-400" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]"><span>MEM ALLOC</span><span>2.4GB</span></div>
                <div className="h-1 bg-cyan-900/50 rounded-full overflow-hidden">
                  <motion.div animate={{ width: '45%' }} className="h-full bg-cyan-400" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]"><span>NET TRAFFIC</span><span>0.4 MB/S</span></div>
                <div className="h-1 bg-cyan-900/50 rounded-full overflow-hidden">
                  <motion.div animate={{ width: ['10%', '60%', '30%'] }} transition={{ duration: 2, repeat: Infinity }} className="h-full bg-cyan-400" />
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* Main Content: Threat Map - On mobile it stays on top for visibility */}
        <main className="panel h-80 lg:h-full bg-[#050c14]/90 border border-cyan-500/30 relative flex flex-col min-h-0 order-first lg:order-none shrink-0 lg:shrink">
          <div className="absolute top-0 left-0 bg-cyan-700/50 text-[10px] px-2 py-0.5 border-b border-r border-cyan-500 font-bold uppercase z-10">Threat Ops</div>
          <div className="flex-1 overflow-hidden relative">
            <iframe 
              src="https://threatmap.fortiguard.com" 
              className="w-full h-full border-none pointer-events-auto grayscale opacity-80 contrast-125 scale-[1.5] lg:scale-100 origin-center"
              title="FortiGuard Threat Map"
            />
          </div>
        </main>

        {/* Intelligence Feed */}
        <aside className="panel h-fit min-h-[300px] lg:h-full bg-[#050c14]/90 border border-cyan-500/30 p-4 relative flex flex-col gap-4 overflow-hidden shrink-0 lg:shrink">
          <div className="absolute top-0 left-0 bg-cyan-700/50 text-[10px] px-2 py-0.5 border-b border-r border-cyan-500 font-bold uppercase z-10">Attribution</div>
          
          <div className="mt-6 flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            <div className="p-3 border border-red-500/30 bg-red-500/5 rounded">
              <h4 className="text-[10px] font-bold text-red-500 mb-1 flex items-center gap-1 uppercase">
                <AlertTriangle className="w-3 h-3" /> CISA Warning
              </h4>
              <p className="text-[9px] text-red-200 uppercase leading-tight italic">
                CVE-2026-5281: Zero-Day targeting U.S. Federal infrastructure.
              </p>
            </div>

            <AnimatePresence>
              {threats.map(threat => (
                <motion.div 
                  key={threat.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 border border-yellow-500/30 bg-yellow-500/5 rounded text-[10px] space-y-2"
                >
                  <div className="flex justify-between items-start border-b border-yellow-500/20 pb-1">
                    <h5 className="font-bold text-yellow-500 uppercase">{threat.name}</h5>
                    <span className="text-green-500 font-bold tracking-tighter">● {threat.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 text-cyan-100/70">
                    <span className="uppercase">Proxy IP:</span> <span className="text-right text-red-400 font-bold">{threat.ip}</span>
                  </div>
                  <div className="pt-1 border-t border-yellow-500/10 text-cyan-200/50 italic leading-tight">
                    TTP: {threat.ttp}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* Terminal Footer - Fixed bottom on mobile, side-by-side on desktop */}
      <footer className="fixed bottom-0 left-0 w-full lg:relative lg:bottom-auto panel bg-[#020609] border-t lg:border-t-0 border-cyan-500/30 h-[180px] md:h-[220px] flex flex-col lg:flex-row overflow-hidden shrink-0 z-40">
        <div className="absolute top-0 left-0 bg-cyan-700/50 text-[10px] px-2 py-0.5 border-b border-r border-cyan-500 font-bold uppercase z-10">Terminal</div>
        <div className="flex-1 p-3 md:p-4 overflow-y-auto font-mono text-[10px] md:text-xs flex flex-col gap-2 custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 items-start border-b border-cyan-900/10 pb-1 last:border-0">
              <span className="text-cyan-500/30 shrink-0 font-bold text-[9px] mt-0.5">[{log.timestamp}]</span>
              <div className={`flex-1 break-words leading-tight ${
                log.type === 'ai' ? 'text-cyan-400' : 
                log.type === 'user' ? 'text-white italic' : 
                log.type === 'action' ? 'text-green-500 font-bold underline' : 
                'text-cyan-500/40'
              }`}>
                {log.text}
              </div>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* SOAR Playbook Visualization Overlay for Mobile Accessibility */}
        <AnimatePresence>
          {activePlaybookSteps.length > 0 && (
            <motion.div 
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="absolute inset-0 bg-[#020609]/98 z-50 p-4 border-t border-cyan-500"
            >
              <div className="text-[10px] text-yellow-500 font-bold uppercase mb-3 flex items-center gap-1">
                <Activity className="w-2.5 h-2.5" /> Playbook Active
              </div>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                {activePlaybookSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className="shrink-0">
                      {step.status === 'success' ? <UserCheck className="w-3 h-3 text-green-500" /> : <Lock className="w-3 h-3 text-cyan-900" />}
                    </div>
                    <div className="text-[8px] uppercase font-bold text-cyan-400 truncate">{step.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-10 lg:h-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-cyan-500/30 p-2 lg:p-4 flex flex-row lg:flex-col gap-4 bg-black/40 items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full border ${isListening ? 'border-red-500/50 bg-red-500/10' : 'border-cyan-500/50 bg-cyan-500/10'}`}>
              <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-red-500 animate-pulse' : 'text-cyan-500 opacity-50'}`} />
            </div>
            <div className="text-[9px] uppercase font-bold text-cyan-400 hidden sm:block">Voice Link</div>
          </div>
          <div className="flex-1 h-3 lg:h-auto lg:w-full border border-cyan-500/20 bg-black/40 rounded px-2 lg:p-4 flex items-center justify-center min-w-[100px]">
             {isListening ? (
              <div className="flex items-center gap-0.5">
                {[...Array(6)].map((_, i) => (
                  <motion.div key={i} animate={{ height: [4, 12, 4] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }} className="w-1 bg-cyan-400" />
                ))}
              </div>
            ) : (
              <div className="text-[8px] uppercase opacity-30 text-center tracking-tighter">VOICE READY</div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
