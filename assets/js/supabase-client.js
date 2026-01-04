/**
 * Supabase Client para Chumbi Digital LMS
 *
 * CONFIGURACION: Reemplaza las credenciales con las de tu proyecto Supabase
 */

// ============================================
// CONFIGURACION SUPABASE
// ============================================
const SUPABASE_URL = 'https://yjdrvgmgitqiaoejfxil.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_64AxB3y1XI9_WrO4xW6bUg_hmlmBT7i';

// Cliente listo para usar

// Inicializar cliente Supabase
const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTH STORE - Estado global de autenticacion
// ============================================
const AuthStore = {
  user: null,
  profile: null,
  session: null,
  initialized: false,
  listeners: [],

  // Inicializar estado de auth
  async init() {
    if (this.initialized || !supabase) return;

    try {
      // Obtener sesion actual
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        this.session = session;
        this.user = session.user;
        await this.loadProfile();
      }

      // Escuchar cambios de auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[Auth] Estado cambiado:', event);

        this.session = session;
        this.user = session?.user || null;

        if (session) {
          await this.loadProfile();
        } else {
          this.profile = null;
        }

        // Notificar a listeners
        this.notifyListeners();

        // Dispatch evento global para Alpine.js
        window.dispatchEvent(new CustomEvent('auth:changed', {
          detail: { user: this.user, profile: this.profile, event }
        }));
      });

      this.initialized = true;
    } catch (error) {
      console.error('[Auth] Error inicializando:', error);
    }
  },

  // Cargar perfil del usuario
  async loadProfile() {
    if (!this.user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', this.user.id)
        .single();

      if (!error && data) {
        this.profile = data;
      }
    } catch (error) {
      console.error('[Auth] Error cargando perfil:', error);
    }
  },

  // Verificar si esta autenticado
  isAuthenticated() {
    return !!this.session && !!this.user;
  },

  // Verificar si es premium
  isPremium() {
    return this.profile?.subscription_tier === 'premium' ||
           this.profile?.subscription_tier === 'vip';
  },

  // Verificar si es VIP
  isVIP() {
    return this.profile?.subscription_tier === 'vip';
  },

  // Verificar acceso a un tier
  hasAccessToTier(tier) {
    const tierHierarchy = { 'free': 0, 'premium': 1, 'vip': 2 };
    const userTier = tierHierarchy[this.profile?.subscription_tier || 'free'];
    const requiredTier = tierHierarchy[tier] || 0;
    return userTier >= requiredTier;
  },

  // Obtener nombre para mostrar
  getDisplayName() {
    return this.profile?.full_name ||
           this.user?.user_metadata?.full_name ||
           this.user?.email?.split('@')[0] ||
           'Usuario';
  },

  // Obtener avatar
  getAvatarUrl() {
    return this.profile?.avatar_url ||
           this.user?.user_metadata?.avatar_url ||
           null;
  },

  // Agregar listener de cambios
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },

  // Notificar listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({ user: this.user, profile: this.profile });
      } catch (e) {
        console.error('[Auth] Error en listener:', e);
      }
    });
  }
};

// ============================================
// AUTH - Funciones de autenticacion
// ============================================
const Auth = {
  // Registrar nuevo usuario
  async signUp(email, password, fullName = '') {
    if (!supabase) return { error: { message: 'Supabase no configurado' } };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    return { data, error };
  },

  // Iniciar sesion con email/password
  async signIn(email, password) {
    if (!supabase) return { error: { message: 'Supabase no configurado' } };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  },

  // Iniciar sesion con Google
  async signInWithGoogle() {
    if (!supabase) return { error: { message: 'Supabase no configurado' } };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback.html`
      }
    });

    return { data, error };
  },

  // Iniciar sesion con GitHub
  async signInWithGitHub() {
    if (!supabase) return { error: { message: 'Supabase no configurado' } };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback.html`
      }
    });

    return { data, error };
  },

  // Cerrar sesion
  async signOut() {
    if (!supabase) return { error: { message: 'Supabase no configurado' } };

    const { error } = await supabase.auth.signOut();

    if (!error) {
      // Limpiar localStorage legacy
      localStorage.removeItem('chumbi_auth');
      localStorage.removeItem('chumbi_user');
    }

    return { error };
  },

  // Solicitar reset de password
  async resetPassword(email) {
    if (!supabase) return { error: { message: 'Supabase no configurado' } };

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password.html`
    });

    return { data, error };
  },

  // Actualizar password
  async updatePassword(newPassword) {
    if (!supabase) return { error: { message: 'Supabase no configurado' } };

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    return { data, error };
  },

  // Actualizar perfil
  async updateProfile(updates) {
    if (!supabase || !AuthStore.user) {
      return { error: { message: 'No autenticado' } };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', AuthStore.user.id)
      .select()
      .single();

    if (!error && data) {
      AuthStore.profile = data;
      AuthStore.notifyListeners();
    }

    return { data, error };
  }
};

// ============================================
// HELPER - Componente Alpine.js para auth
// ============================================
function createAuthComponent(options = {}) {
  return {
    user: null,
    profile: null,
    loading: true,

    async init() {
      await AuthStore.init();
      this.user = AuthStore.user;
      this.profile = AuthStore.profile;
      this.loading = false;

      // Escuchar cambios
      window.addEventListener('auth:changed', (e) => {
        this.user = e.detail.user;
        this.profile = e.detail.profile;
      });

      // Callback opcional
      if (options.onInit) {
        options.onInit(this);
      }
    },

    get isAuthenticated() {
      return !!this.user;
    },

    get isPremium() {
      return this.profile?.subscription_tier === 'premium' ||
             this.profile?.subscription_tier === 'vip';
    },

    get displayName() {
      return AuthStore.getDisplayName();
    },

    get avatarUrl() {
      return AuthStore.getAvatarUrl();
    },

    async signOut() {
      await Auth.signOut();
      window.location.href = '/auth/login.html';
    }
  };
}

// ============================================
// Inicializacion automatica
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  if (supabase) {
    AuthStore.init();
  }
});

// Exportar para uso global
window.supabaseClient = supabase;
window.AuthStore = AuthStore;
window.Auth = Auth;
window.createAuthComponent = createAuthComponent;
