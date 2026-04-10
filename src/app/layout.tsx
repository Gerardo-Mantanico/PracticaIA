import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Remove known extension-injected attributes before React hydrates to avoid hydration mismatches
          (e.g. NightEye adds `nighteye="disabled"` on the html element). This script runs early
          during parse so the attribute is removed before React attempts to hydrate. */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const attrs = ['nighteye']; attrs.forEach(a => document.documentElement.removeAttribute(a)); } catch (e) { /* ignore */ } })();`,
          }}
        />
      </head>
      <body className="dark:bg-gray-900">
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
             {/* <Toaster toastOptions={{ style: { zIndex: 9999 } }} /> */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
