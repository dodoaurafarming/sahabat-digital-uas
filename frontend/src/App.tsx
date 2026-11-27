import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { QuizCTASection } from './components/QuizCTASection';
import { StatsSection } from './components/StatsSection';
import { Footer } from './components/Footer';
import { AnimatedSection } from './components/AnimatedSection';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CurhatStudentPage } from './pages/CurhatStudentPage';
import { MaterialDetailPage } from './pages/MaterialDetailPage';
import { QuizIntroPage } from './pages/QuizIntroPage';
import { QuizPage } from './pages/QuizPage';
import { RewardPage } from './pages/RewardPage';
import { ProfilePage } from './pages/ProfilePage';
import { TeacherInboxPage } from './pages/TeacherInboxPage';
import { AdminPendingPage } from './pages/AdminPendingPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ChatRoomPage } from './pages/ChatRoomPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import {
  authApi,
  clearAuthSession,
  getAuthToken,
  sendPresenceBeacon,
  setUnauthorizedHandler,
  usersApi,
} from './services/api';
import type { AppPage, ChatPeerInfo, User, UserRole } from './types/models';
import { isCurhatRestrictedForUser } from './utils/accessControl';

const VALID_PAGES: AppPage[] = [
  'home',
  'login',
  'register',
  'profile',
  'curhat',
  'material',
  'quiz-intro',
  'quiz',
  'reward',
  'teacher-inbox',
  'chat-room',
  'admin-pending',
  'admin-login',
  'faq',
  'contact',
  'privacy',
  'terms',
];

const getInitialPage = (): AppPage => {
  const path = window.location.pathname.replace(/^\//, '');
  return VALID_PAGES.includes(path as AppPage) ? (path as AppPage) : 'home';
};

function BlockedCurhatModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F294A]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl">
        <div className="text-6xl">🌟</div>
        <h3 className="font-playful mt-4 text-2xl font-bold text-[#2B569A]">
          Halo, Adik Hebat! 👋
        </h3>
        <p className="font-clean mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Fitur <span className="font-bold text-[#00B5D8]">Ruang Curhat</span>{' '}
          khusus untuk kakak-kakak{' '}
          <span className="font-bold">kelas 4, 5, dan 6</span> ya.
        </p>
        <p className="font-clean mt-2 text-sm leading-relaxed text-slate-500">
          Kalau kamu kelas 1–3, jangan sedih! Kamu tetap bisa belajar di{' '}
          <span className="font-bold text-[#7BB642]">Pusat Materi</span> dan{' '}
          <span className="font-bold text-[#7BB642]">Latihan Soal</span>. Untuk
          cerita, silakan ke Bapak/Ibu Guru di kelas atau Orang Tua di rumah ya.
          🎒✨
        </p>
        <button
          type="button"
          onClick={onClose}
          className="font-playful mt-6 w-full cursor-pointer rounded-full bg-[#00B5D8] px-6 py-3 text-base font-bold text-white shadow-md transition hover:bg-[#2B569A]"
        >
          Mengerti, Terima Kasih!
        </button>
      </div>
    </div>
  );
}

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<AppPage>(getInitialPage());
  const [score, setScore] = useState<number>(0);
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [chatPeer, setChatPeer] = useState<ChatPeerInfo | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(() =>
    Boolean(getAuthToken()),
  );
  const [showBlockedModal, setShowBlockedModal] = useState<boolean>(false);

  const activeRole: UserRole = userRole ?? 'siswa';
  const activeDisplayName =
    currentUser?.name ||
    (activeRole === 'guru'
      ? 'Bu Rina'
      : activeRole === 'admin'
        ? 'Administrator'
        : 'Raka');

  const homeForRole = (role: UserRole | null): AppPage =>
    role === 'guru'
      ? 'teacher-inbox'
      : role === 'admin'
        ? 'admin-pending'
        : 'home';

  const navigateTo = (page: AppPage) => {
    const path = page === 'home' ? '/' : `/${page}`;
    window.history.pushState({ page }, '', path);
    setCurrentPage(page);
  };

  const replaceTo = (page: AppPage) => {
    const path = page === 'home' ? '/' : `/${page}`;
    window.history.replaceState({ page }, '', path);
    setCurrentPage(page);
  };

  const handleFooterNavigate = (page: string) => {
    if (VALID_PAGES.includes(page as AppPage)) {
      navigateTo(page as AppPage);
    }
  };

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const page = (e.state?.page as AppPage) || 'home';
      setCurrentPage(page);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const syncUserProfile = async () => {
    try {
      const response = await usersApi.getProfile();
      const user = response.user;
      setCurrentUser(user);
      setIsLoggedIn(true);
      setUserRole(user.role);
      localStorage.setItem('user', JSON.stringify(user));
      authApi.presence(true).catch(() => {});
    } catch {
      clearAuthSession();
      setIsLoggedIn(false);
      setUserRole(null);
      setCurrentUser(null);
      replaceTo('home');
    } finally {
      setIsInitializing(false);
    }
  };

  // Tangani token JWT kedaluwarsa (HTTP 401) secara global tanpa hard reload
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setIsLoggedIn(false);
      setUserRole(null);
      setCurrentUser(null);
      setCurrentRoomId(null);
      setChatPeer(null);
      window.history.replaceState({ page: 'home' }, '', '/');
      setCurrentPage('home');
    });
    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    let cancelled = false;
    const controller = new AbortController();

    usersApi
      .getProfile(controller.signal)
      .then((response) => {
        if (cancelled) return;
        const user = response.user;
        setCurrentUser(user);
        setIsLoggedIn(true);
        setUserRole(user.role);
        localStorage.setItem('user', JSON.stringify(user));
        authApi.presence(true).catch(() => {});
      })
      .catch(() => {
        if (cancelled) return;
        clearAuthSession();
        setIsLoggedIn(false);
        setUserRole(null);
        setCurrentUser(null);
        window.history.replaceState({ page: 'home' }, '', '/');
        setCurrentPage('home');
      })
      .finally(() => {
        if (!cancelled) {
          setIsInitializing(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const markOffline = () => sendPresenceBeacon(false);
    const handleVisibilityChange = () => {
      authApi.presence(!document.hidden).catch(() => {});
    };

    window.addEventListener('beforeunload', markOffline);
    window.addEventListener('pagehide', markOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', markOffline);
      window.removeEventListener('pagehide', markOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn]);

  // Turunkan halaman efektif berdasarkan peran aktif agar guru/admin selalu pada rute yang tepat
  let effectivePage: AppPage = currentPage;
  if (
    isLoggedIn &&
    userRole === 'guru' &&
    !['teacher-inbox', 'profile', 'chat-room'].includes(currentPage)
  ) {
    effectivePage = 'teacher-inbox';
  } else if (
    isLoggedIn &&
    userRole === 'admin' &&
    !['admin-pending', 'profile'].includes(currentPage)
  ) {
    effectivePage = 'admin-pending';
  }

  useEffect(() => {
    if (effectivePage !== currentPage) {
      const path = effectivePage === 'home' ? '/' : `/${effectivePage}`;
      window.history.replaceState({ page: effectivePage }, '', path);
    }
  }, [effectivePage, currentPage]);

  const handleNavigateDaftar = () => navigateTo('register');
  const handleNavigateLogin = () => navigateTo('login');

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    clearAuthSession();
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    setCurrentRoomId(null);
    setChatPeer(null);
    replaceTo('home');
  };

  const handleStartCurhat = () => {
    if (userRole === 'guru' && isLoggedIn) {
      navigateTo('teacher-inbox');
      return;
    }
    if (userRole === 'admin' && isLoggedIn) {
      navigateTo('admin-pending');
      return;
    }
    if (isCurhatRestrictedForUser(currentUser)) {
      setShowBlockedModal(true);
      return;
    }
    navigateTo('curhat');
  };

  const handleOpenMaterial = () => navigateTo('material');
  const handleStartQuiz = () => navigateTo('quiz-intro');

  const handleOpenChat = (roomId: number, peerData: ChatPeerInfo) => {
    setCurrentRoomId(roomId);
    setChatPeer(peerData);
    navigateTo('chat-room');
  };

  const handleBackFromChat = () => {
    setCurrentRoomId(null);
    setChatPeer(null);
    navigateTo(userRole === 'guru' ? 'teacher-inbox' : 'curhat');
  };

  const handleLoginCompleted = (
    role: UserRole,
    user: User,
    targetPage?: AppPage,
  ) => {
    setCurrentUser(user);
    setUserRole(role);
    setIsLoggedIn(true);
    replaceTo(targetPage ?? homeForRole(role));
    syncUserProfile();
  };

  const navbarProps = {
    isLoggedIn,
    userId: currentUser?.id,
    role: userRole ?? 'siswa',
    userName: currentUser?.name || activeDisplayName,
    userAvatar: currentUser?.avatar_full_url || currentUser?.avatar_url,
    onNavigateHome: () => navigateTo(homeForRole(userRole)),
    onNavigateProfile: () => navigateTo('profile'),
    onNavigateChat: () =>
      navigateTo(
        userRole === 'guru'
          ? 'teacher-inbox'
          : userRole === 'admin'
            ? 'admin-pending'
            : 'curhat',
      ),
    onNavigateMaterial: () => navigateTo('material'),
    onNavigateCurhat: () =>
      navigateTo(
        userRole === 'guru'
          ? 'teacher-inbox'
          : userRole === 'admin'
            ? 'admin-pending'
            : 'curhat',
      ),
    onNavigateDaftar: handleNavigateDaftar,
    onNavigateLogin: handleNavigateLogin,
    onLogout: handleLogout,
  };

  const loginFallback = (target: AppPage) => (
    <LoginPage
      onBackHome={() => navigateTo('home')}
      onNavigateDaftar={handleNavigateDaftar}
      onLoginSuccess={(role, user) =>
        handleLoginCompleted(
          role,
          user,
          role === 'siswa' ? target : homeForRole(role),
        )
      }
    />
  );

  if (isInitializing) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#2B569A] text-white">
        Memuat...
      </div>
    );
  }

  if (effectivePage === 'login') {
    return (
      <LoginPage
        onBackHome={() => navigateTo('home')}
        onNavigateDaftar={handleNavigateDaftar}
        onLoginSuccess={(role, user) => handleLoginCompleted(role, user)}
      />
    );
  }

  if (effectivePage === 'register') {
    return (
      <RegisterPage
        onBackHome={() => navigateTo('home')}
        onNavigateLogin={handleNavigateLogin}
      />
    );
  }

  if (
    effectivePage === 'faq' ||
    effectivePage === 'contact' ||
    effectivePage === 'privacy' ||
    effectivePage === 'terms'
  ) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-[#2B569A]">
        <Navbar {...navbarProps} />
        <main className="flex-1 bg-white">
          {effectivePage === 'faq' && (
            <FAQPage onBackHome={() => navigateTo('home')} />
          )}
          {effectivePage === 'contact' && (
            <ContactPage onBackHome={() => navigateTo('home')} />
          )}
          {effectivePage === 'privacy' && (
            <PrivacyPage onBackHome={() => navigateTo('home')} />
          )}
          {effectivePage === 'terms' && (
            <TermsPage onBackHome={() => navigateTo('home')} />
          )}
        </main>
        <Footer onNavigate={handleFooterNavigate} />
      </div>
    );
  }

  if (effectivePage === 'admin-login') {
    return (
      <AdminLoginPage
        onBackHome={() => navigateTo('home')}
        onLoginSuccess={(role, user) =>
          handleLoginCompleted(role, user, 'admin-pending')
        }
      />
    );
  }

  if (effectivePage === 'admin-pending') {
    if (!isLoggedIn || userRole !== 'admin') {
      return (
        <AdminLoginPage
          onBackHome={() => navigateTo('home')}
          onLoginSuccess={(role, user) =>
            handleLoginCompleted(role, user, 'admin-pending')
          }
        />
      );
    }
    return (
      <div className="flex min-h-screen w-full flex-col bg-[#2B569A]">
        <Navbar
          {...navbarProps}
          onNavigateChat={() => navigateTo('admin-pending')}
          onNavigateCurhat={() => navigateTo('admin-pending')}
        />
        <main className="flex-1 bg-[#F3F8FC]">
          <AdminPendingPage />
        </main>
      </div>
    );
  }

  if (effectivePage === 'teacher-inbox') {
    if (!isLoggedIn || userRole !== 'guru') return loginFallback('teacher-inbox');
    return (
      <div className="flex min-h-screen w-full flex-col bg-[#2B569A]">
        <Navbar
          {...navbarProps}
          onNavigateChat={() => navigateTo('teacher-inbox')}
          onNavigateCurhat={() => navigateTo('teacher-inbox')}
        />
        <main className="flex-1 bg-[#F3F8FC]">
          <TeacherInboxPage onOpenChat={handleOpenChat} />
        </main>
      </div>
    );
  }

  if (effectivePage === 'chat-room' && currentRoomId && chatPeer) {
    if (!isLoggedIn || !currentUser) return loginFallback('chat-room');
    return (
      <ChatRoomPage
        roomId={currentRoomId}
        currentUser={currentUser}
        peerData={chatPeer}
        onBack={handleBackFromChat}
      />
    );
  }

  if (effectivePage === 'profile') {
    if (!isLoggedIn) return loginFallback('profile');
    return (
      <div className="flex min-h-screen w-full flex-col bg-[#2B569A]">
        <Navbar {...navbarProps} />
        <main className="flex-1 bg-white">
          <ProfilePage
            role={userRole ?? 'siswa'}
            onBackHome={() => navigateTo(homeForRole(userRole))}
            onProfileUpdated={(updatedUser) => {
              setCurrentUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }}
          />
        </main>
        <Footer onNavigate={handleFooterNavigate} />
      </div>
    );
  }

  if (effectivePage === 'quiz-intro') {
    if (!isLoggedIn) return loginFallback('quiz-intro');
    return (
      <QuizIntroPage
        onStartQuiz={() => navigateTo('quiz')}
        onBackHome={() => navigateTo('home')}
      />
    );
  }

  if (effectivePage === 'quiz') {
    if (!isLoggedIn) return loginFallback('quiz-intro');
    return (
      <QuizPage
        onFinish={(finalScore) => {
          setScore(finalScore);
          navigateTo('reward');
        }}
        onBackHome={() => navigateTo('home')}
      />
    );
  }

  if (effectivePage === 'reward') {
    return (
      <RewardPage
        score={score}
        totalQuestions={10}
        onRestart={() => navigateTo('quiz-intro')}
        onBackHome={() => navigateTo('home')}
      />
    );
  }

  if (effectivePage === 'material') {
    if (!isLoggedIn) return loginFallback('material');
    return (
      <div className="flex min-h-screen w-full flex-col bg-[#2B569A]">
        <Navbar {...navbarProps} />
        <main className="flex-1 bg-white">
          <MaterialDetailPage
            onStartQuiz={handleStartQuiz}
            onBackHome={() => navigateTo(homeForRole(userRole))}
          />
        </main>
        <Footer onNavigate={handleFooterNavigate} />
      </div>
    );
  }

  if (effectivePage === 'curhat') {
    if (!isLoggedIn) return loginFallback('curhat');
    return (
      <>
        <BlockedCurhatModal
          open={showBlockedModal}
          onClose={() => setShowBlockedModal(false)}
        />
        <div className="flex min-h-screen w-full flex-col bg-[#2B569A]">
          <Navbar
            {...navbarProps}
            onNavigateChat={() => navigateTo('curhat')}
            onNavigateCurhat={() => navigateTo('curhat')}
          />
          <main className="flex-1 bg-white">
            <CurhatStudentPage
              currentUser={currentUser}
              onBackHome={() => navigateTo('home')}
              onOpenChat={handleOpenChat}
            />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <BlockedCurhatModal
        open={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
      />
      <div className="flex min-h-screen w-full flex-col bg-[#2B569A]">
        <Navbar {...navbarProps} />
        <main className="flex-1 bg-white">
          <HeroSection onStartCurhat={handleStartCurhat} />
          <AnimatedSection>
            <FeaturesSection
              currentUser={currentUser}
              onStartCurhat={handleStartCurhat}
              onOpenMaterial={handleOpenMaterial}
              onStartQuiz={handleStartQuiz}
            />
          </AnimatedSection>
          <AnimatedSection>
            <QuizCTASection onStartQuiz={handleStartQuiz} />
          </AnimatedSection>
          <AnimatedSection>
            <StatsSection />
          </AnimatedSection>
        </main>
        <Footer onNavigate={handleFooterNavigate} />
      </div>
    </>
  );
}

export default App;
