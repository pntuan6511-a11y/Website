type MailOptions = {
  subject: string
  text: string
  html?: string
  to?: string
}

import { prisma } from '@/lib/prisma'

const SMTP_HOST = process.env.SMTP_HOST || ''
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const EMAIL_ADMIN = process.env.SMTP_USER || ''
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || ''
const SEND_MAIL = String(process.env.SEND_MAIL || 'true').toLowerCase() === 'true'

let cachedSmtpUser: string | null = null
let cachedSmtpPass: string | null = null
let cachedSendMail: boolean | null = null

async function loadSmtpFromDb() {
  if (cachedSmtpUser !== null && cachedSmtpPass !== null) return { user: cachedSmtpUser, pass: cachedSmtpPass }

  try {
    type SettingRow = { key: string; value: string }
    const settings = await prisma.setting.findMany({ where: { key: { in: ['SMTP_USER', 'SMTP_PASS'] } } }) as SettingRow[]
    const user = settings.find((s: SettingRow) => s.key === 'SMTP_USER')?.value || ''
    const pass = settings.find((s: SettingRow) => s.key === 'SMTP_PASS')?.value || ''
    cachedSmtpUser = user
    cachedSmtpPass = pass
    return { user, pass }
  } catch (err) {
    // If DB is not available or error, fallback to env
    return { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' }
  }
}

async function loadSendMailFromDb() {
  if (cachedSendMail !== null) return cachedSendMail
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'SEND_MAIL' } })
    if (row && typeof row.value === 'string') {
      const v = String(row.value).toLowerCase()
      cachedSendMail = v === 'true'
      return cachedSendMail
    }
    cachedSendMail = String(process.env.SEND_MAIL || 'true').toLowerCase() === 'true'
    return cachedSendMail
  } catch (err) {
    return String(process.env.SEND_MAIL || 'true').toLowerCase() === 'true'
  }
}

export async function sendEmailToAdmin({ subject, text, html, to }: MailOptions) {
  const sendMailEnabled = await loadSendMailFromDb()
  if (!sendMailEnabled) {
    console.log('SEND_MAIL disabled; skipping email send')
    return
  }
  debugger
  const { user: SMTP_USER, pass: SMTP_PASS } = await loadSmtpFromDb()

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_USER) {
    console.warn('SMTP not configured: missing settings or env vars')
    return
  }

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  })

  const fromHeader = EMAIL_FROM_NAME ? `"${EMAIL_FROM_NAME}" <${SMTP_USER}>` : SMTP_USER

  const mailOptions = {
    from: fromHeader,
    to: to || SMTP_USER,
    subject,
    text,
    html
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent user', SMTP_USER, info.messageId)
  } catch (err) {
    console.error('Failed to send email', err)
  }
}

export function buildAdminHtml(title: string, rows: Record<string, string | number | null | undefined>) {
  const rowHtml = Object.entries(rows)
    .map(([k, v]) => {
      const value = v == null ? '' : String(v)
      if (k.toLowerCase().includes('sđt') || k.toLowerCase().includes('phone')) {
        // clickable phone
        const tel = value.replace(/[^+0-9]/g, '')
        return `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#333">${k}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a73e8"><a href="tel:${tel}" style="color:#1a73e8;text-decoration:none">${value}</a></td>
          </tr>`
      }
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#333">${k}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555">${value}</td>
        </tr>`
    })
    .join('\n')

  return `
    <div style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
      <div style="max-width:680px;margin:24px auto;padding:20px;border-radius:8px;background:#ffffff;border:1px solid #f0f0f0;box-shadow:0 6px 18px rgba(16,24,40,0.06)">
        <h2 style="margin:0 0 12px 0;font-size:18px;color:#0f172a">${title}</h2>
        <p style="margin:0 0 18px 0;color:#374151">Thông tin chi tiết phía dưới — nhấn số điện thoại để gọi trực tiếp.</p>

        <table style="width:100%;border-collapse:collapse;background:transparent">
          <tbody>
            ${rowHtml}
          </tbody>
        </table>
      </div>
    </div>
  `
}
