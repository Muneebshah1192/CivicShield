import { create } from 'zustand';

export type UserRole = 'CITIZEN' | 'WORKER' | 'OFFICER' | 'ADMIN' | 'SUPER_ADMIN';
export type ThemeMode = 'dark' | 'light';

interface CivicShieldState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  
  activeFilterStatus: string;
  setActiveFilterStatus: (status: string) => void;
  
  activeFilterCategory: string;
  setActiveFilterCategory: (category: string) => void;
  
  showHotspots: boolean;
  setShowHotspots: (show: boolean) => void;
  
  showOnboardingGuide: boolean;
  setShowOnboardingGuide: (show: boolean) => void;
  
  chatbotOpen: boolean;
  setChatbotOpen: (open: boolean) => void;
  
  notifications: string[];
  addNotification: (msg: string) => void;
}

export const useCivicShieldStore = create<CivicShieldState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.add('light');
      } else {
        root.classList.remove('light');
      }
      localStorage.setItem('civicshield_theme', theme);
    }
    set({ theme });
  },
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (nextTheme === 'light') {
        root.classList.add('light');
      } else {
        root.classList.remove('light');
      }
      localStorage.setItem('civicshield_theme', nextTheme);
    }
    return { theme: nextTheme };
  }),

  currentRole: 'CITIZEN',
  setCurrentRole: (role) => set({ currentRole: role }),
  
  selectedIncidentId: null,
  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),
  
  activeFilterStatus: 'ALL',
  setActiveFilterStatus: (status) => set({ activeFilterStatus: status }),
  
  activeFilterCategory: 'ALL',
  setActiveFilterCategory: (category) => set({ activeFilterCategory: category }),
  
  showHotspots: false,
  setShowHotspots: (show) => set({ showHotspots: show }),
  
  showOnboardingGuide: true,
  setShowOnboardingGuide: (show) => set({ showOnboardingGuide: show }),
  
  chatbotOpen: false,
  setChatbotOpen: (open) => set({ chatbotOpen: open }),

  notifications: [
    "🚨 CRITICAL SLA ALERT: INC-1042 Fallen Pole remaining response window < 15m",
    "🛡️ AI Fraud Agent: Filtered non-actionable placeholder complaint",
    "✨ Multi-Agent Fusion: 3 duplicate reports merged into INC-1043",
  ],
  addNotification: (msg) => set((state) => ({ notifications: [msg, ...state.notifications] })),
}));
