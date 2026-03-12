// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation"; // To highlight the active page

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // current URL path

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Diet Tracker", href: "/viewer" },
    { name: "Health Summary", href: "/health" },
    { name: "Blood Pressure", href: "/bp" },
  ];

  return (
    <html lang="en">
      <body>
        {/* Header */}
        <header className="header">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1 style={{ marginBottom: 0 }}>Personal Health Dashboard</h1>
            <nav className="nav">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname === item.href ? "active-link" : ""}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="container">{children}</main>
      </body>
    </html>
  );
}