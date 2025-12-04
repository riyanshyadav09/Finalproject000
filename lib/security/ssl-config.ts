import crypto from 'crypto'

export const SSL_CONFIG = {
  protocols: ['TLSv1.2', 'TLSv1.3'],
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'AES256-GCM-SHA384',
    'AES128-GCM-SHA256'
  ].join(':'),
  
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https:;",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
}

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
}

export class DataEncryption {
  private static readonly algorithm = 'aes-256-gcm'

  static encrypt(text: string, key: string): { encrypted: string; iv: string; tag: string } {
    const keyBuffer = Buffer.from(key, 'hex')
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, keyBuffer)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string {
    const keyBuffer = Buffer.from(key, 'hex')
    const iv = Buffer.from(encryptedData.iv, 'hex')
    const tag = Buffer.from(encryptedData.tag, 'hex')
    
    const decipher = crypto.createDecipher(this.algorithm, keyBuffer)
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}

export class RSAKeyManager {
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    })
    return { publicKey, privateKey }
  }

  static encryptWithPublicKey(data: string, publicKey: string): string {
    const encrypted = crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(data, 'utf8'))
    return encrypted.toString('base64')
  }
}

export class HashManager {
  static hash(data: string): string {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.createHash('sha256')
    hash.update(data + salt)
    return hash.digest('hex') + ':' + salt
  }

  static verify(data: string, hashedData: string): boolean {
    const [hash, salt] = hashedData.split(':')
    const newHash = crypto.createHash('sha256')
    newHash.update(data + salt)
    return newHash.digest('hex') === hash
  }
}