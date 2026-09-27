<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>429 Too Many Requests - NAAP Careers</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Instrument Sans', sans-serif;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 0.4; }
            100% { transform: scale(0.95); opacity: 0.8; }
        }
        .pulse-ring {
            animation: pulse-ring 2.5s infinite ease-in-out;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col justify-between antialiased selection:bg-[#ffdd59] selection:text-[#193153]">

    <!-- Header Navigation Bar -->
    <header class="bg-[#193153] text-white py-4 px-6 shadow-md border-b border-blue-900/40">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                    <img src="/images/logo.png" alt="NAAP Logo" class="w-full h-full object-contain" onError="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <span class="text-[#ffdd59] font-black text-lg hidden">N</span>
                </div>
                <div>
                    <h1 class="font-bold text-base tracking-wide text-white group-hover:text-[#ffdd59] transition-colors">NAAP Careers</h1>
                    <p class="text-[11px] text-slate-300 font-medium tracking-wider uppercase">National Aviation Academy of the Philippines</p>
                </div>
            </a>
            <a href="/" class="text-xs font-semibold text-slate-300 hover:text-[#ffdd59] transition-colors flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return to Home
            </a>
        </div>
    </header>

    <!-- Main Body Container -->
    <main class="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <!-- Background subtle decorative gradient blobs -->
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 text-center relative z-10 space-y-6">
            
            <!-- Security Shield Icon Container -->
            <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div class="absolute inset-0 bg-amber-500/20 rounded-full pulse-ring"></div>
                <div class="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-inner relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                    </svg>
                </div>
            </div>

            <!-- Header Badge & Status Title -->
            <div class="space-y-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    ⚠️ Error 429 &bull; Rate Limit Exceeded
                </span>
                <h2 class="text-2xl font-bold text-[#193153] tracking-tight">Too Many Login Attempts</h2>
                <p class="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    To protect your account from unauthorized access, login attempts have been temporarily restricted due to multiple failed tries.
                </p>
            </div>

            <!-- Dynamic Live Countdown Box -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Security Cool-down Timer</p>
                <div id="countdown-wrapper" class="flex items-center justify-center gap-2">
                    <span id="countdown-timer" class="font-mono text-3xl font-black text-[#193153]">00:60</span>
                </div>
                <p id="countdown-status" class="text-[11px] text-slate-500 font-medium">Please wait before trying to log in again.</p>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3 pt-2">
                <a id="login-btn" href="/login" class="w-full inline-flex items-center justify-center gap-2 bg-[#193153] hover:bg-[#193153]/90 text-[#ffdd59] font-bold text-sm py-3 px-6 rounded-xl shadow-md transition-all duration-200 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Return to Login Page
                </a>
                
                <div class="flex items-center justify-center gap-4 text-xs font-medium text-slate-600 pt-1">
                    <a href="/forgot-password" class="hover:text-blue-600 hover:underline transition-colors flex items-center gap-1">
                        🔑 Forgot Password?
                    </a>
                    <span class="text-slate-300">&bull;</span>
                    <a href="mailto:hr@naap.edu.ph" class="hover:text-blue-600 hover:underline transition-colors flex items-center gap-1">
                        💬 Contact HR Support
                    </a>
                </div>
            </div>

        </div>
    </main>

    <!-- Footer Bar -->
    <footer class="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
        <p>&copy; {{ date('Y') }} National Aviation Academy of the Philippines (NAAP). All rights reserved.</p>
    </footer>

    <!-- Countdown Timer Script -->
    <script>
        (function() {
            let secondsLeft = 60;
            const timerEl = document.getElementById('countdown-timer');
            const statusEl = document.getElementById('countdown-status');
            const loginBtn = document.getElementById('login-btn');

            function updateTimerDisplay() {
                const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
                const secs = String(secondsLeft % 60).padStart(2, '0');
                if (timerEl) timerEl.textContent = `${mins}:${secs}`;
            }

            updateTimerDisplay();

            const interval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    updateTimerDisplay();
                } else {
                    clearInterval(interval);
                    if (timerEl) {
                        timerEl.textContent = "00:00";
                        timerEl.classList.remove('text-[#193153]');
                        timerEl.classList.add('text-emerald-600');
                    }
                    if (statusEl) {
                        statusEl.textContent = "✅ Security cool-down complete. You may try logging in now!";
                        statusEl.classList.remove('text-slate-500');
                        statusEl.classList.add('text-emerald-700', 'font-bold');
                    }
                }
            }, 1000);
        })();
    </script>
</body>
</html>
