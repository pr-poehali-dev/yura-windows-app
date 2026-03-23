import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type Page = "home" | "commands";

const SIDEBAR_PASSWORD = "1234";

const VOICE_COMMANDS = [
  { id: 1, trigger: "открой браузер", description: "Запускает браузер по умолчанию", icon: "Globe", app: "Chrome / Edge" },
  { id: 2, trigger: "открой проводник", description: "Открывает файловый менеджер", icon: "FolderOpen", app: "Explorer" },
  { id: 3, trigger: "открой калькулятор", description: "Запускает калькулятор", icon: "Calculator", app: "Калькулятор" },
  { id: 4, trigger: "открой блокнот", description: "Запускает текстовый редактор", icon: "FileText", app: "Notepad" },
  { id: 5, trigger: "открой настройки", description: "Открывает системные настройки", icon: "Settings", app: "Настройки" },
  { id: 6, trigger: "открой терминал", description: "Запускает командную строку", icon: "Terminal", app: "CMD / PowerShell" },
  { id: 7, trigger: "сделай скриншот", description: "Создаёт снимок экрана", icon: "Camera", app: "Снимок экрана" },
  { id: 8, trigger: "выключи компьютер", description: "Завершает работу системы", icon: "Power", app: "Система" },
];

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("В ожидании команды...");

  // Password
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Canvas waveform animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const lines = isListening ? 5 : 3;
      for (let l = 0; l < lines; l++) {
        ctx.beginPath();
        const amp = isListening ? 18 + l * 6 : 4 + l * 2;
        const freq = 0.018 + l * 0.004;
        const speed = isListening ? 0.06 + l * 0.01 : 0.015 + l * 0.003;
        const alpha = isListening ? 0.5 - l * 0.07 : 0.15 - l * 0.02;

        ctx.strokeStyle = `rgba(200, 200, 220, ${alpha})`;
        ctx.lineWidth = isListening ? 1.5 - l * 0.2 : 0.8;

        for (let x = 0; x <= w; x += 2) {
          const y = h / 2 + Math.sin(x * freq + t * speed + l * 1.2) * amp
            + Math.sin(x * freq * 2.3 + t * speed * 1.4 + l) * (amp * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      t++;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setStatus("В ожидании команды...");
      setTranscript("");
    } else {
      setIsListening(true);
      setStatus("Слушаю...");
      setTimeout(() => {
        setTranscript("открой браузер");
        setStatus("Выполняю команду...");
        setTimeout(() => {
          setTranscript("");
          setStatus("Команда выполнена");
          setIsListening(false);
          setTimeout(() => setStatus("В ожидании команды..."), 2000);
        }, 1500);
      }, 2500);
    }
  };

  const handleSidebarToggle = () => {
    if (!isUnlocked) {
      setShowPasswordInput(true);
      setSidebarOpen(true);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === SIDEBAR_PASSWORD) {
      setIsUnlocked(true);
      setShowPasswordInput(false);
      setPasswordInput("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
      setTimeout(() => setPasswordError(false), 1500);
    }
  };

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: "home", label: "Главная", icon: "Mic2" },
    { id: "commands", label: "Команды", icon: "List" },
  ];

  return (
    <div className="min-h-screen bg-black font-body overflow-hidden relative flex">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://cdn.poehali.dev/projects/851f1200-6d66-4d68-aaa5-3161e99a7441/bucket/81896302-38c5-4097-9666-171bc7bbd0ae.jpg)`,
          opacity: 0.35,
        }}
      />
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? "w-64" : "w-16"}`}
        style={{ background: "rgba(4,4,4,0.92)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Toggle btn */}
        <button
          onClick={handleSidebarToggle}
          className="flex items-center justify-center w-16 h-16 text-white/50 hover:text-white/90 transition-colors flex-shrink-0"
        >
          <Icon name={sidebarOpen ? "ChevronLeft" : "Menu"} size={20} />
        </button>

        {/* Password gate */}
        {sidebarOpen && showPasswordInput && !isUnlocked && (
          <div className="px-4 py-6 animate-fade-in">
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest mb-3">Введите пароль</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              maxLength={8}
              placeholder="••••"
              className={`w-full bg-white/5 border text-white/90 font-mono text-sm px-3 py-2 rounded outline-none placeholder:text-white/20 transition-all ${
                passwordError ? "border-red-500/60 animate-pulse" : "border-white/10 focus:border-white/30"
              }`}
              autoFocus
            />
            {passwordError && (
              <p className="text-red-400/80 font-mono text-xs mt-2">Неверный пароль</p>
            )}
            <button
              onClick={handlePasswordSubmit}
              className="mt-3 w-full py-2 text-xs font-mono text-white/60 hover:text-white/90 border border-white/10 hover:border-white/30 rounded transition-all"
            >
              Войти
            </button>
          </div>
        )}

        {/* Nav items */}
        {sidebarOpen && isUnlocked && (
          <nav className="flex-1 py-4 animate-fade-in">
            <div className="px-4 mb-6">
              <p className="text-white/25 font-mono text-xs uppercase tracking-[0.2em]">Навигация</p>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setSidebarOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-all ${
                  page === item.id
                    ? "text-white/95 bg-white/8"
                    : "text-white/40 hover:text-white/70 hover:bg-white/4"
                }`}
              >
                <Icon name={item.icon} size={16} />
                <span className="font-body tracking-wide">{item.label}</span>
                {page === item.id && (
                  <div className="ml-auto w-0.5 h-4 bg-white/50 rounded" />
                )}
              </button>
            ))}

            <div className="absolute bottom-8 left-0 right-0 px-4">
              <div className="border-t border-white/8 pt-4">
                <p className="text-white/20 font-mono text-xs">ARIA v1.0</p>
                <p className="text-white/15 font-mono text-xs mt-0.5">Голосовой помощник</p>
              </div>
            </div>
          </nav>
        )}

        {/* Collapsed icons */}
        {!sidebarOpen && (
          <nav className="flex-1 pt-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center justify-center w-16 h-12 transition-colors ${
                  page === item.id ? "text-white/90" : "text-white/30 hover:text-white/60"
                }`}
              >
                <Icon name={item.icon} size={18} />
              </button>
            ))}
          </nav>
        )}
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 ml-16 min-h-screen flex flex-col">

        {/* HOME PAGE */}
        {page === "home" && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 animate-fade-in">
            {/* Title */}
            <div className="text-center mb-16">
              <h1 className="font-display text-7xl font-light text-white/90 tracking-[0.1em] mb-2">
                ARIA
              </h1>
              <p className="font-mono text-xs text-white/25 uppercase tracking-[0.4em]">
                Голосовой помощник для ПК
              </p>
            </div>

            {/* Waveform */}
            <div className="w-full max-w-lg h-20 mb-12 relative">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            {/* Mic button */}
            <div className="relative mb-10">
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse-ring" />
                  <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse-ring" style={{ animationDelay: "0.4s" }} />
                </>
              )}
              <button
                onClick={toggleListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? "bg-white/15 border-2 border-white/50 shadow-[0_0_30px_rgba(200,200,220,0.3)]"
                    : "bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30"
                }`}
              >
                <Icon name={isListening ? "MicOff" : "Mic"} size={28} className="text-white/80" />
              </button>
            </div>

            {/* Status */}
            <div className="text-center space-y-2">
              <p className="font-mono text-xs text-white/35 uppercase tracking-[0.3em]">
                {status}
              </p>
              {transcript && (
                <p className="font-display text-xl text-white/70 italic animate-fade-in">
                  «{transcript}»
                </p>
              )}
            </div>

            {/* Quick hint */}
            <div className="absolute bottom-12 text-center">
              <p className="font-mono text-xs text-white/15">
                Нажмите на микрофон чтобы начать
              </p>
            </div>
          </div>
        )}

        {/* COMMANDS PAGE */}
        {page === "commands" && (
          <div className="flex-1 py-16 px-8 max-w-3xl animate-fade-in">
            <div className="mb-12">
              <h2 className="font-display text-5xl font-light text-white/85 tracking-wide mb-2">
                Команды
              </h2>
              <p className="font-mono text-xs text-white/25 uppercase tracking-[0.3em]">
                {VOICE_COMMANDS.length} голосовых команд
              </p>
            </div>

            <div className="space-y-1">
              {VOICE_COMMANDS.map((cmd, i) => (
                <div
                  key={cmd.id}
                  className="group flex items-center gap-4 px-4 py-4 border border-transparent hover:border-white/8 hover:bg-white/3 rounded transition-all duration-200 cursor-default"
                  style={{ animationDelay: `${i * 0.05}s`, animation: "fade-in 0.5s ease-out forwards", opacity: 0 }}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded border border-white/8 bg-white/3 flex-shrink-0">
                    <Icon name={cmd.icon} size={14} className="text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-white/80">
                      «{cmd.trigger}»
                    </p>
                    <p className="font-body text-xs text-white/30 mt-0.5">
                      {cmd.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="font-mono text-xs text-white/20 group-hover:text-white/35 transition-colors">
                      {cmd.app}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 border border-white/6 rounded bg-white/2">
              <p className="font-mono text-xs text-white/25 leading-relaxed">
                Скажите команду вслух после нажатия на микрофон на главной странице.
                Помощник распознает речь и выполнит нужное действие.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
