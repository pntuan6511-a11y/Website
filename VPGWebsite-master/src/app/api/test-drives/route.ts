import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendZaloOAToAdmin } from '@/lib/zalo'
import { sendEmailToAdmin, buildAdminHtml } from '@/lib/mail'

export async function GET() {
  try {
    const testDrives = await prisma.testDrive.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(testDrives)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test drives' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, phone, carId, carName, testDate } = body

    const testDrive = await prisma.testDrive.create({
      data: {
        fullName,
        phone,
        carId,
        carName,
        testDate: new Date(testDate)
      }
    })

    // Notify admin via Zalo OA (best-effort)
    try {
      const msg = `ĐĂNG KÝ LÁI THỬ mới\nTên: ${fullName}\nSĐT: ${phone}\nXe: ${carName || carId}\nNgày: ${testDate}`
      await sendZaloOAToAdmin(msg)
    } catch (err) {
      console.error('Failed to notify admin via Zalo OA', err)
    }

    // Send email to admin (best-effort)
    try {
      const subject = `Đăng ký lái thử mới từ ${fullName}`
      const text = `Tên: ${fullName}\nSĐT: ${phone}\nXe: ${carName || carId}\nNgày: ${testDate}\nID: ${testDrive.id}`
      const html = buildAdminHtml(`Đăng ký lái thử mới từ ${fullName}`, {
        'Tên': fullName,
        'SĐT': phone,
        'Xe': carName || carId,
        'Ngày': testDate,
        'ID': testDrive.id
      })
      await sendEmailToAdmin({ subject, text, html })
    } catch (err) {
      console.error('Failed to send admin email', err)
    }

    return NextResponse.json(testDrive)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create test drive' }, { status: 500 })
  }
}
