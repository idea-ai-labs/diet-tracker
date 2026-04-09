"use client";
import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Diet Tracker", href: "/viewer" },
    { name: "Health Summary", href: "/health-summary" },
    { name: "Blood Pressure", href: "/bp" },
  ];

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  // Detect mobile width
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <html lang="en">
      <body>
        <header className="header">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h1 style={{ margin: 0, fontSize: "20px" }}>Personal Health Dashboard</h1>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Hamburger only on mobile */}
                {isMobile && (
                  <button
                    className="secondary"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    ☰
                  </button>
                )}
                {/* Logout button */}
                <button onClick={handleLogout} className="secondary">
                  Logout
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav
              className="nav"
              style={{
                display: isMobile ? (menuOpen ? "flex" : "none") : "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
              }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname === item.href ? "active-link" : ""}
                  onClick={() => setMenuOpen(false)} // auto-close menu on mobile
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="container">{children}</main>
      </body>
    </html>
  );
}
