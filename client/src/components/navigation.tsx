import { useAuthContext } from "./auth-provider";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Navigation() {
  const { user, logout } = useAuthContext();
  const [location] = useLocation();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-lotus text-primary text-2xl mr-3"></i>
              <h1 className="text-xl font-bold text-gray-900">YogaTerapia</h1>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {user.role === 'instructor' ? (
                <>
                  <Link href="/">
                    <a className={`px-1 pt-1 pb-4 text-sm font-medium border-b-2 ${
                      isActive('/') 
                        ? 'text-primary border-primary' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                    }`}>
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/patients">
                    <a className={`px-1 pt-1 pb-4 text-sm font-medium border-b-2 ${
                      isActive('/patients') 
                        ? 'text-primary border-primary' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                    }`}>
                      Pacientes
                    </a>
                  </Link>
                  <Link href="/series">
                    <a className={`px-1 pt-1 pb-4 text-sm font-medium border-b-2 ${
                      isActive('/series') 
                        ? 'text-primary border-primary' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                    }`}>
                      Series
                    </a>
                  </Link>
                  <Link href="/library">
                    <a className={`px-1 pt-1 pb-4 text-sm font-medium border-b-2 ${
                      isActive('/library') 
                        ? 'text-primary border-primary' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                    }`}>
                      Biblioteca
                    </a>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/">
                    <a className={`px-1 pt-1 pb-4 text-sm font-medium border-b-2 ${
                      isActive('/') 
                        ? 'text-primary border-primary' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                    }`}>
                      Mi Serie
                    </a>
                  </Link>
                  <Link href="/history">
                    <a className={`px-1 pt-1 pb-4 text-sm font-medium border-b-2 ${
                      isActive('/history') 
                        ? 'text-primary border-primary' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                    }`}>
                      Historial
                    </a>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user.name}</span>
              <Badge variant={user.role === 'instructor' ? 'default' : 'secondary'}>
                {user.role === 'instructor' ? 'Instructor' : 'Paciente'}
              </Badge>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-bell text-lg"></i>
            </button>
            <Button variant="ghost" onClick={logout} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-sign-out-alt text-lg"></i>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
