"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Factory, ShieldCheck, Package, Users, LogOut,
    LayoutDashboard, Database, Truck
} from "lucide-react";

const navItems = {
    Manufacturer: [
        { href: "/manufacturer", label: "Dashboard", icon: LayoutDashboard },
        { href: "/database", label: "Batch Records", icon: Database },
    ],
    Admin: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/users", label: "User Management", icon: Users },
        { href: "/database", label: "All Records", icon: Database },
    ],
    Supplier: [
        { href: "/supplier", label: "Dashboard", icon: Truck },
    ],
    Pharmacist: [
        { href: "/pharmacist", label: "Dashboard", icon: ShieldCheck },
    ],
    Consumer: [
        { href: "/", label: "Home", icon: LayoutDashboard },
    ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[--medical-bg]">
                <div className="animate-pulse text-teal-600">Loading...</div>
            </div>
        );
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    const role = (session.user?.role as keyof typeof navItems) || "Consumer";
    const items = navItems[role] || navItems.Consumer;

    const roleIcons: Record<string, React.ReactNode> = {
        Manufacturer: <Factory size={20} />,
        Admin: <ShieldCheck size={20} />,
        Supplier: <Truck size={20} />,
        Pharmacist: <Package size={20} />,
        Consumer: <Users size={20} />,
    };

    return (
        <div className="min-h-screen flex bg-[--medical-bg]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-screen">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white">
                            {roleIcons[role]}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">{session.user?.name}</p>
                            <p className="text-xs text-slate-500">{role}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                            <item.icon size={18} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 mt-auto">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto ml-64">
                {children}
            </main>
        </div>
    );
}
