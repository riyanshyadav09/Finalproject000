import crypto from 'crypto'
import { Transform } from 'stream'

export class StreamEncryption {
  private static readonly algorithm = 'aes-256-ctr'
  
  static createEncryptionStream(key: string): Transform {
    const keyBuffer = Buffer.from(key, 'hex')
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, keyBuffer)
    
    return new Transform({
      transform(chunk, encoding, callback) {
        try {
          const encrypted = cipher.update(chunk)
          callback(null, encrypted)
        } catch (error) {
          callback(error)
        }
      },
      flush(callback) {
        try {
          const final = cipher.final()
          callback(null, final)
        } catch (error) {
          callback(error)
        }
      }
    })
  }

  static createDecryptionStream(key: string): Transform {
    const keyBuffer = Buffer.from(key, 'hex')
    const iv = crypto.randomBytes(16)
    const decipher = crypto.createDecipher(this.algorithm, keyBuffer)
    
    return new Transform({
      transform(chunk, encoding, callback) {
        try {
          const decrypted = decipher.update(chunk)
          callback(null, decrypted)
        } catch (error) {
          callback(error)
        }
      },
      flush(callback) {
        try {
          const final = decipher.final()
          callback(null, final)
        } catch (error) {
          callback(error)
        }
      }
    })
  }

  static generateStreamKey(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static createSecureVideoUrl(videoId: string, userId: string): string {
    const timestamp = Date.now()
    const expiry = timestamp + (24 * 60 * 60 * 1000) // 24 hours
    
    const payload = {
      videoId,
      userId,
      timestamp,
      expiry
    }
    
    const signature = crypto
      .createHmac('sha256', process.env.VIDEO_SIGNING_KEY || 'default-key')
      .update(JSON.stringify(payload))
      .digest('hex')
    
    const token = Buffer.from(JSON.stringify({ ...payload, signature })).toString('base64')
    
    return `/api/stream/${videoId}?token=${token}`
  }

  static validateStreamToken(token: string): { videoId: string; userId: string } | null {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
      
      // Check expiry
      if (Date.now() > payload.expiry) {
        return null
      }
      
      // Verify signature
      const { signature, ...data } = payload
      const expectedSignature = crypto
        .createHmac('sha256', process.env.VIDEO_SIGNING_KEY || 'default-key')
        .update(JSON.stringify(data))
        .digest('hex')
      
      if (signature !== expectedSignature) {
        return null
      }
      
      return { videoId: payload.videoId, userId: payload.userId }
    } catch {
      return null
    }
  }
}