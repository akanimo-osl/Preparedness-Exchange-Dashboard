import { Loading } from "@/components/Loading";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Updating } from "@/components/Updating";
import LiveFeedWatchlist from "@/components/usables/LiveFeedWatchlist";
import NewsTicker from "@/components/usables/NewsTicker";
import { useToast } from "@/contexts/ToastProvider";
import { readiness } from "@/services/readiness";
import type { BaseReadiness } from "@/types/readiness_type";
import { useEffect, useState } from "react";
import AssessmentCard from "@/components/readiness/AssessmentCard";
import RegionalHeatmap from "@/components/readiness/RegionalHeatmap";
import Dropdown from "@/components/usables/Dropdown";
import { capitalize, normalizeText } from "@/utils";
import SmartPagination from "@/components/usables/SmartPagination";

const data = [
    {
      title: "Surveillance",
      question:
        "Does the region have active surveillance systems for this hazard?",
    },
    {
      title: "Laboratory",
      question:
        "Are laboratory facilities equipped to diagnose this hazard?",
    },
    {
      title: "Response",
      question: "Are response protocols and resources in place?",
    },
    {
      title: "Communication",
      question: "Are risk communication systems established?",
    },
    {
      title: "Coordination",
      question:
        "Is there inter-agency coordination for emergency response?",
    },
];

export default function Readiness(){
    const { showToast } = useToast();
    const tabs = [
        "Arbo Virus", "Cholera", "Cholera Subnational", "Cyclone", "FVD", "FVD PoE", "Lassa Fever", "Lassa Fever District",
        "Marburg", "Meningitis", "Meningitise Elimination", "Mpox", "Mpox District", "Natural Disaster", "Rift Valley Fever"
    ];
    const [countries, setCountries] = useState<string[]>([])
    const [country, setCountry] = useState("madagascar")

    const [activeTab, setActiveTab] = useState("Arbo Virus");
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState({
        answered_questions: 0, completion_pct: 0, total_questions: 0
    })
    const [readinesses, setReadinesses] = useState<BaseReadiness[]>()

    const [page, setPage] = useState(1)
    const [count, setCount] = useState(0)
    const PAGE_SIZE = 15
    useEffect(()=>{
        const loadEsparSummary = async()=>{
            try {
              setLoading(true)
              const response = await readiness.summary(page, PAGE_SIZE, activeTab, country)
              setReadinesses(response.results)
              setCountries(response.countries)
              setCount(response.count)
              setSummary({
                answered_questions: response.answered_questions, completion_pct: response.completion_pct, total_questions: response.total_questions
              })
              // showToast(response.message, "success", 5000);  
            } catch (error: any) {
              showToast(error?.message || "An Error Ocurred while retrieving data", "error", 5000);
            } finally {
              setLoading(false)
            }
        }
        loadEsparSummary()
    }, [page, activeTab, country])
    
    if (loading && !readinesses) return <Loading />

    return (
        <div className="w-full text-white">
            <section className="flex flex-row gap-3 justify-stretch mt-4">
                <section className="grow min-w-0 space-y-6 max-w-full">
                    <NewsTicker />
                    <div className="text-[#e6dfc7]">
                        {/* PAGE TITLE */}
                        <h1 className="text-2xl font-bold">Readiness Assessment</h1>
                        <p className="text-sm opacity-70 mb-6">Multi-hazard preparedness evaluation</p>

                        {/* TABS */}
                        <div className="flex flex-wrap mb-6 bg-black/30">
                            {tabs.map((t) => (
                            <button
                                key={t}
                                onClick={() =>{setActiveTab(t)}}
                                className={`px-4 py-2 text-sm font-medium ${
                                activeTab === t
                                    ? "bg-yellow-500 text-black"
                                    : "hover:bg-yellow-900/40 text-gray-300"
                                }`}
                            >
                                {t}
                            </button>
                            ))}
                        </div>
                        
                        <div className="flex justify-between mb-3">
                            <div>
                                {loading && <Updating />}
                            </div>
                            <Dropdown
                            label="Country"
                            showLabel={false}
                            value={country}
                            onChange={setCountry}
                            items={countries}
                            bgColor="#433006"
                            allowEmptyDefault={false}
                            />
                        </div>

                        {/* OVERALL SCORE CARD */}
                        <div className="bg-black/30 border border-white/10 p-4 rounded-xl flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-semibold">{activeTab} Readiness</h2>
                                <p className="text-sm opacity-70">Overall completion percentage, total and answered questions</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-bold">{Number(summary.completion_pct ?? 0).toFixed(2)}%</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="bg-[#F59F0A] rounded-full text-white py-1 px-2 text-xs ">Total Question - {summary.total_questions}</p>
                                    <p className="bg-[#F59F0A] rounded-full text-white py-1 px-2 text-xs ">Answered Question - {summary.answered_questions}</p>
                                </div>
                                
                            </div>
                        </div>

                        {/* MATRIX TITLE */}
                        <h2 className="text-xl font-semibold">Preparedness Matrix</h2>
                        <p className="text-sm opacity-70 mb-4">
                            Domain-level readiness assessment (click cells to view details)
                        </p>

                        {/* TABLE */}
                        <div className="bg-[#1C1607] rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                            <thead className="bg-black/30">
                                <tr className="text-left">
                                    <th className="p-4 whitespace-nowrap">Admin Level</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Question</th>
                                    <th className="p-4">Question Key</th>
                                    <th className="p-4 whitespace-nowrap">Question Score</th>
                                    <th className="p-4 whitespace-nowrap">Category Weight</th>
                                    <th className="p-4 whitespace-nowrap">Category Score</th>
                                    <th className="p-4">Language</th>
                                </tr>
                            </thead>

                            <tbody>
                                {readinesses?.map((d, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-4">{d.admin_level}</td>
                                    <td className="p-4">{d.category}</td>
                                    <td className="p-4">{d.question}</td>
                                    <td className="p-4">{d.question_key}</td>
                                    <td className="p-4">{d.question_score}</td>
                                    <td className="p-4">{d.category_weight}</td>
                                    <td className="p-4">{d.category_score}</td>
                                    <td className="p-4">{d.language}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#1C1607] p-6 rounded-xl">
                        <h1 className="text-xl font-bold text-white mb-2">
                            Detailed Assessment Questions
                        </h1>
                        <p className="text-neutral-400 mb-4">Score each preparedness domain</p>
                        <div className="grid grid-cols-2 gap-6">  
                            {readinesses?.map((item) => (
                                <AssessmentCard
                                key={item.category}
                                title={item.category}
                                question={item.question}
                                score={item.question_score}
                                max_score={5}
                                />
                            ))}
                        </div>
                    </div>

                    <SmartPagination
                    count={count}
                    pageSize={PAGE_SIZE}
                    currentPage={page}
                    onPageChange={(page) => setPage(page)}
                    darkMode={true}
                    />
                </section>

                <section className="">
                    <LiveFeedWatchlist />
                </section>
            </section>
            
            <div className="pr-5 my-6">
                <RegionalHeatmap readinessType={normalizeText(activeTab)} />
            </div>
        </div>
    )
}