import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routes = {
  '/': 'Tableau de bord',
  '/calendar': 'Calendrier',
  '/teams': 'Équipes',
  '/clients': 'Clients',
  '/tasks': 'Tâches',
  '/statistics': 'Statistiques',
  '/intervention-reports': 'Rapports d\'intervention'
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500">
      <Link
        to="/"
        className="flex items-center hover:text-gray-700 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {pathnames.length > 0 && (
        <ChevronRight className="h-4 w-4 text-gray-400" />
      )}

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name} className="flex items-center">
            <Link
              to={routeTo}
              className={`${
                isLast 
                  ? 'text-gray-900 font-medium cursor-default pointer-events-none' 
                  : 'hover:text-gray-700'
              }`}
            >
              {routes[routeTo as keyof typeof routes]}
            </Link>
            
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
            )}
          </div>
        );
      })}
    </nav>
  );
}