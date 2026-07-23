/**
 * Maps raw Supabase Auth error messages to plain-language copy. Never show a
 * raw Supabase error/code to the user — always route it through here.
 */
export function friendlyAuthError(rawMessage: string): string {
  const m = rawMessage.toLowerCase();

  if (m.includes("already registered") || m.includes("already exists")) {
    return "That email is already in use. Try signing in instead.";
  }
  if (m.includes("invalid login credentials")) {
    // Deliberately identical wording for "wrong password" and "no such
    // account" — we don't want to confirm which accounts exist.
    return "Invalid email or password.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email before signing in — check your inbox for the confirmation link.";
  }
  if (m.includes("password should be at least") || m.includes("password is too short")) {
    return "Password must be at least 8 characters.";
  }
  if (m.includes("unable to validate email") || m.includes("invalid email")) {
    return "That doesn't look like a valid email address.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Too many attempts — please wait a moment and try again.";
  }
  if (m.includes("network")) {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
