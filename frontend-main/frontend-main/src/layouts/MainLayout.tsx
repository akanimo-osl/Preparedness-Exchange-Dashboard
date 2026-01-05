import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/Topbar";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout: React.FC = () => {
    const { pathname } = useLocation();

    // Map each route to a Tailwind gradient
    const gradients: Record<string, string> = {
        "/chw": "bg-gradient-to-br from-[#0A573E] via-[#0E2516] to-[#000000]",
        "/ihr": "bg-gradient-to-br from-[#164053] via-[#0D2732] to-[#030C10]", 
        "/readiness": "bg-gradient-to-br from-[#362A0E] via-[#100C03] to-[#100C03]",
        "/star_tracker": "bg-gradient-to-br from-[#2A1A3F] via-[#170928] to-[#10041F]",
        "/alerts": "bg-gradient-to-br from-[#35373B] via-[#2E3135] to-[#26292C]",
    };

    // Default gradient
    const defaultGradient = "bg-gradient-to-br from-[#11244D] via-[#071022] to-[#030710]";

    const layoutGradient = gradients[pathname] || defaultGradient;

    return (
        <div className={`flex font-Fellix ${layoutGradient}`}>
            <div className="sticky top-0 h-screen overflow-y-auto shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1 flex flex-col min-h-screen min-w-0 ">  {/* Add min-w-0 overflow-hidden */}
                {/* <TopBar />  */}
                <div className="flex flex-nowrap gap-3 grow min-w-0 overflow-hidden">  {/* Add min-w-0 */}
                    <div className="grow min-w-0 overflow-y-auto">  {/* Add min-w-0 */}
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default MainLayout;