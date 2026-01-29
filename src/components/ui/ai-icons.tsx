"use client";

interface IconProps {
  className?: string;
  size?: number;
}

export function OpenAIIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

export function AnthropicIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.304 3.541h-3.677l6.696 16.918h3.677l-6.696-16.918zm-10.608 0L0 20.459h3.729l1.329-3.453h6.494l1.329 3.453h3.729L9.914 3.541H6.696zm.508 10.569l2.29-5.947 2.29 5.947H7.204z" />
    </svg>
  );
}

export function GoogleIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function MetaIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a4.892 4.892 0 0 0 1.227 2.243c.532.524 1.2.823 1.988.823.402 0 .87-.086 1.358-.27a9.566 9.566 0 0 0 1.62-.816c.573-.36 1.161-.811 1.748-1.34.578-.52 1.103-1.065 1.565-1.625l.3-.37.3.37c.46.56.985 1.104 1.563 1.625.587.529 1.175.98 1.748 1.34.544.337 1.086.617 1.62.816.489.184.956.27 1.358.27.78 0 1.449-.3 1.983-.823a4.892 4.892 0 0 0 1.227-2.243c.14-.604.21-1.267.21-1.973 0-2.566-.702-5.24-2.043-7.303-1.188-1.834-2.903-3.114-4.871-3.114a4.186 4.186 0 0 0-3.194 1.498l-.19.238-.19-.238A4.186 4.186 0 0 0 6.914 4.03zm0 1.467c.957 0 1.861.582 2.631 1.619l.197.265.197-.265c.77-1.037 1.674-1.619 2.631-1.619 1.468 0 2.857 1.037 3.901 2.65 1.18 1.822 1.804 4.165 1.804 6.302 0 .585-.061 1.14-.178 1.626a3.435 3.435 0 0 1-.844 1.559c-.294.289-.626.44-1.008.44-.242 0-.534-.06-.868-.186a8.166 8.166 0 0 1-1.384-.694c-.5-.313-1.025-.706-1.55-1.182a15.853 15.853 0 0 1-1.471-1.525l-.792-.936-.792.936a15.853 15.853 0 0 1-1.471 1.525c-.525.476-1.05.87-1.55 1.182-.44.278-.898.514-1.384.694-.334.127-.626.186-.868.186-.382 0-.714-.15-1.008-.44a3.435 3.435 0 0 1-.844-1.559 6.503 6.503 0 0 1-.178-1.626c0-2.137.623-4.48 1.804-6.302 1.044-1.613 2.433-2.65 3.9-2.65zm2.827 5.015a2.028 2.028 0 1 0 0 4.056 2.028 2.028 0 0 0 0-4.056zm4.83 0a2.028 2.028 0 1 0 0 4.056 2.028 2.028 0 0 0 0-4.056z" />
    </svg>
  );
}

export function GroqIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12h8M12 8v8" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

export function SambaNovaIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MistralIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <rect x="2" y="4" width="4" height="4" />
      <rect x="18" y="4" width="4" height="4" />
      <rect x="6" y="8" width="4" height="4" />
      <rect x="14" y="8" width="4" height="4" />
      <rect x="2" y="12" width="4" height="4" />
      <rect x="10" y="12" width="4" height="4" />
      <rect x="18" y="12" width="4" height="4" />
      <rect x="6" y="16" width="4" height="4" />
      <rect x="14" y="16" width="4" height="4" />
    </svg>
  );
}

export function getModelIcon(provider: string) {
  const providerLower = provider.toLowerCase();
  if (providerLower.includes("openai") || providerLower.includes("gpt")) {
    return OpenAIIcon;
  }
  if (providerLower.includes("anthropic") || providerLower.includes("claude")) {
    return AnthropicIcon;
  }
  if (providerLower.includes("google") || providerLower.includes("gemini")) {
    return GoogleIcon;
  }
  if (providerLower.includes("meta") || providerLower.includes("llama")) {
    return MetaIcon;
  }
  if (providerLower.includes("groq")) {
    return GroqIcon;
  }
  if (providerLower.includes("samba") || providerLower.includes("sambanova")) {
    return SambaNovaIcon;
  }
  if (providerLower.includes("mistral")) {
    return MistralIcon;
  }
  return OpenAIIcon;
}
