// This code should run both on `node` and the `edge`.
export async function createCodeChallenge(length = 43) {
  const codeVerifier = generateCodeVerifier(length);

  // Calculate the SHA-256 hash of the code verifier
  const hash = await hash256(codeVerifier);

  const hashBase64 = btoa(hash)
    .replace("+", "-")
    .replace("/", "_")
    .replace(/=+$/, "");

  return hashBase64;
}

function generateCodeVerifier(length = 43) {
  if (length < 43 || length > 128) {
    throw new Error(
      "code verifier length must be between 43 and 128 characters"
    );
  }

  // Generate a random string of the specified length
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let codeVerifier = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    codeVerifier += charset.charAt(randomIndex);
  }

  return codeVerifier;
}

function hash256(data: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    return hash256_webCrypto(data);
  }

  return hash256_crypto_es(data);
}

async function hash256_webCrypto(data: string): Promise<string> {
  function bufferToHex(arrayBuffer: ArrayBuffer) {
    const buffer = new Uint8Array(arrayBuffer);
    return Array.from(buffer, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  }

  const encoded = new TextEncoder().encode(data);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return bufferToHex(buffer);
}

async function hash256_crypto_es(data: string): Promise<string> {
  const { SHA256 } = await import("crypto-es/lib/sha256");
  const hash = SHA256(data).toString(); // by default uses hex
  return Promise.resolve(hash);
}
