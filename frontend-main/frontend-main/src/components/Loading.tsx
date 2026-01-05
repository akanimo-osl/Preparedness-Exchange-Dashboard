import { Loader2 } from "lucide-react"

export const Loading = () => {
    return (
            <div className="w-full h-full self-stretch flex flex-row items-center justify-center">
                <div className="flex flex-row items-center gap-2">
                    <Loader2 className="text-white animate-spin w-5 h-5" />
                    <p className="text-white">loading data...</p>
                </div>
            </div>
        )
}