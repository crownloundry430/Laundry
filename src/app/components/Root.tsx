import { Outlet, Link, useLocation } from "react-router";
import { Home, ShoppingBag, Package, User } from "lucide-react";

export function Root() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to="/new-order"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/new-order")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs">New Order</span>
          </Link>

          <Link
            to="/orders"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/orders")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <Package className="w-6 h-6" />
            <span className="text-xs">Orders</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/profile")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
