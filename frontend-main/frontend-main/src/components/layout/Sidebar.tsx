import { NavLink } from "react-router-dom";
import { 
  LayoutGrid, Users, Shield, AlertTriangle, MapPin, Bell, FileText, ChevronRight 
} from "lucide-react";

export default function Sidebar() {
  const links = [
    {
      name: "Overview",
      path: "/",
      icon: <LayoutGrid size={18} />,
    },
    {
      name: "CHW Distribution",
      path: "/chw",
      icon: <Users size={18} />,
    },
    {
      name: "IHR / e-SPAR",
      path: "/ihr",
      icon: <Shield size={18} />,
    },
    {
      name: "Readiness",
      path: "/readiness",
      icon: <AlertTriangle size={18} />,
      arrow: true,
    },
    {
      name: "STAR Tracker",
      path: "/star_tracker",
      icon: <MapPin size={18} />,
    },
    {
      name: "Alerts & Incidents",
      path: "/alerts",
      icon: <Bell size={18} />,
      // badge: 3,
    },
    {
      name: "Alerts & Signals",
      path: "/alerts-signals",
      icon: <Bell size={18} />,
    },
    // {
    //   name: "Reports",
    //   path: "/reports",
    //   icon: <FileText size={18} />,
    // },
  ];

  return (
    <div className="w-64 min-h-screen text-white flex flex-col px-4 py-2 space-y-3 flex-shrink-0">

      {/* WHO Logo */}
      <div className="flex flex-col items-center text-center mb-4">
        <img 
          src="/logo.png" 
          alt="WHO" 
          className="w-36 mb-2 opacity-90"
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-1">
        {links.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between p-3 rounded-md cursor-pointer transition 
               ${isActive ? "bg-[#0C7AE91A] text-white" : "text-gray-300 hover:bg-[#0C7AE91A]"}`
            }
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </div>

            {/* Right Arrow */}
            {item.arrow && (
              <ChevronRight size={16} className="text-gray-400" />
            )}

            {/* Badge */}
            {/* {item.badge && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )} */}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
