// Biometric Authentication Utility
// Uses Web Authentication API (WebAuthn)

export const BiometricAuth = {
  // Check if biometric is supported
  isSupported: () => {
    return window.PublicKeyCredential !== undefined &&
           typeof window.PublicKeyCredential === 'function';
  },

  // Check if platform authenticator is available (fingerprint, face ID)
  isPlatformAuthenticatorAvailable: async () => {
    if (!BiometricAuth.isSupported()) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Platform authenticator check failed:', error);
      return false;
    }
  },

  // Register biometric credential
  register: async (userId, userName) => {
    if (!BiometricAuth.isSupported()) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: "Bankify",
          id: window.location.hostname
        },
        user: {
          id: Uint8Array.from(userId, c => c.charCodeAt(0)),
          name: userName,
          displayName: userName
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },   // ES256
          { alg: -257, type: "public-key" }  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred"
        },
        timeout: 60000,
        attestation: "none"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      // Store credential ID
      const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      localStorage.setItem('bankify_biometric_credential', credentialId);
      localStorage.setItem('bankify_biometric_enabled', 'true');

      return {
        success: true,
        credentialId: credentialId
      };
    } catch (error) {
      console.error('Biometric registration failed:', error);
      throw error;
    }
  },

  // Authenticate using biometric
  authenticate: async () => {
    if (!BiometricAuth.isSupported()) {
      throw new Error('Biometric authentication not supported');
    }

    const storedCredentialId = localStorage.getItem('bankify_biometric_credential');
    if (!storedCredentialId) {
      throw new Error('No biometric credential registered');
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credentialId = Uint8Array.from(atob(storedCredentialId), c => c.charCodeAt(0));

      const publicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [{
          id: credentialId,
          type: 'public-key',
          transports: ['internal']
        }],
        userVerification: "required",
        timeout: 60000
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      return {
        success: true,
        assertion: assertion
      };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    }
  },

  // Check if biometric is enabled for user
  isEnabled: () => {
    return localStorage.getItem('bankify_biometric_enabled') === 'true';
  },

  // Disable biometric
  disable: () => {
    localStorage.removeItem('bankify_biometric_credential');
    localStorage.removeItem('bankify_biometric_enabled');
  }
};

// Biometric Auth Component
export const BiometricAuthButton = ({ onSuccess, onError }) => {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const checkSupport = async () => {
      const supported = await BiometricAuth.isPlatformAuthenticatorAvailable();
      setIsSupported(supported);
      setIsEnabled(BiometricAuth.isEnabled());
    };
    checkSupport();
  }, []);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      const result = await BiometricAuth.authenticate();
      onSuccess?.(result);
    } catch (error) {
      onError?.(error);
    }
    setIsLoading(false);
  };

  if (!isSupported || !isEnabled) return null;

  return (
    <button 
      onClick={handleAuth} 
      disabled={isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1
      }}
    >
      {isLoading ? '🔄 Verifying...' : '🔐 Login with Biometric'}
    </button>
  );
};