import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/admin/signin',
  },
})

export const config = {
  matcher: ['/admin/:path((?!signin).*)']
}
