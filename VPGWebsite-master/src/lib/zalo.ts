const ZALO_OA_ACCESS_TOKEN = process.env.ZALO_OA_ACCESS_TOKEN || ''
const ZALO_OA_ADMIN_PHONE = process.env.ZALO_OA_ADMIN_PHONE || ''
const SEND_ZALO = String(process.env.SEND_ZALO || 'true').toLowerCase() === 'true'

function getFetch() {
  // prefer global fetch (Next.js provides it on server). If not available, throw helpful error
  if (typeof fetch !== 'undefined') return fetch.bind(globalThis)
  throw new Error('Global fetch is not available in this environment. Please run on Node 18+/Next.js server or polyfill fetch.')
}

export async function sendZaloOAMessage(recipientPhone: string, message: string) {
  if (!SEND_ZALO) {
    console.log('SEND_ZALO disabled; skipping Zalo OA message')
    return
  }

  if (!ZALO_OA_ACCESS_TOKEN || !ZALO_OA_ADMIN_PHONE) {
    console.warn('Zalo OA not configured: missing env vars')
    return
  }

  const _fetch = getFetch()

  try {
    const res = await _fetch(`https://openapi.zalo.me/v2.0/oa/message?access_token=${encodeURIComponent(ZALO_OA_ACCESS_TOKEN)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: {
          phone: recipientPhone
        },
        message: {
          text: message
        }
      })
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Failed to send Zalo OA message', res.status, text)
    }
  } catch (err) {
    console.error('Zalo OA request failed', err)
  }
}

export async function sendZaloOAToAdmin(message: string) {
  if (!ZALO_OA_ADMIN_PHONE) return
  return sendZaloOAMessage(ZALO_OA_ADMIN_PHONE, message)
}
