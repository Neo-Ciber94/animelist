
// This code should run both on `node` and the `edge`.
export async function createCodeChallenge(length = 43) {
    const codeVerifier = generateCodeVerifier(length);

    // Calculate the SHA-256 hash of the code verifier
    const hash = await hash256(codeVerifier);

    const hashBase64 = btoa(hash)
        .replace('+', '-')
        .replace('/', '_')
        .replace(/=+$/, '');

    return hashBase64;
}

function generateCodeVerifier(length = 43) {
    if (length < 43 || length > 128) {
        throw new Error("code verifier length must be between 43 and 128 characters");
    }

    // Generate a random string of the specified length
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let codeVerifier = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        codeVerifier += charset.charAt(randomIndex);
    }

    return codeVerifier;
}

type CryptoLibrary = 'web_crypto' | 'node' | 'crypto-es';

function getCryptoLibrary(): CryptoLibrary | undefined {
    if (typeof process === 'undefined') {
        return undefined;
    }

    return process.env.MAL_CRYPTO_LIBRARY as CryptoLibrary;
}


function hash256(data: string): Promise<string> {
    const HASHER: Record<CryptoLibrary, (data: string) => Promise<string>> = {
        'web_crypto': hash256_webCrypto,
        'crypto-es': hash256_crypto_es,
        'node': hash256_node,
    };

    // Try to get the current crypto hasher function
    const cryptoLib = getCryptoLibrary();

    if (cryptoLib && HASHER[cryptoLib]) {
        const hasher = HASHER[cryptoLib];
        return hasher(data);
    }

    // Try to determine what crypto library to use

    // 1. try web crypto
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        return hash256_webCrypto(data);
    }

    // 2. try node:crypto
    try {
        return hash256_node(data);
    }
    // eslint-disable-next-line no-empty
    catch { }

    // 3. try crypto-es
    try {
        return hash256_crypto_es(data);
    }
    // eslint-disable-next-line no-empty
    catch { }

    throw new Error(`Failed to generate a sha256, unable to load a module to hash the data`);
}

async function hash256_webCrypto(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const encoded = encoder.encode(data);
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    return decoder.decode(buffer);
}

async function hash256_node(data: string): Promise<string> {
    const nodeCrypto = await import('node:crypto');
    const hasher = nodeCrypto.createHash('sha256');
    hasher.update(data);
    return hasher.digest('hex');
}

async function hash256_crypto_es(data: string): Promise<string> {
    const { SHA256 } = await import('crypto-es/lib/sha256');
    return SHA256(data).toString();
}

