import {Link} from "react-router";
import { useEffect, useState } from "react";

const Navbar = () => {
    const [dark, setDark] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add("theme-dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("theme-dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark]);

    return (
        <nav className="navbar theme-transition">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">READRESUME</p>
            </Link>
            <div className="flex items-center gap-4">
                <button
                  aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                  className="p-2 rounded-full icon-btn"
                  onClick={() => setDark(!dark)}
                >
                  {dark ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                  ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  )}
                </button>

                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
            </div>
        </nav>
    )
}
export default Navbar
