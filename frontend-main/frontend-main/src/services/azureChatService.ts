export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const generateLpiPlanWithAzure = async (scenario: any) => {
    await delay(1500);
    const mockResult = {
        changeSummary: "AI suggested an optimized prepositioning plan based on " + scenario.disease + " risk factors.",
        executiveSummary: "Dynamic outbreak simulation for " + scenario.disease + " in " + scenario.country + ".",
        riskAssessment: {
            riskLevel: scenario.severity,
            reproductionNumberR0: 1.8,
            projectedSpreadRadiusKm: 150
        },
        logisticsConstraints: ["Monsoon season pending", "Limited cold chain storage"],
        planningAssumptions: ["Using a 2-week safety stock", "Cluster A distribution hub"],
        commodityStockpile: [
            {
                category: "PPE",
                items: [{ commodityName: "Gloves", quantity: 5000, unit: "pairs" }]
            }
        ],
        logisticsPlan: {
            prepositioningHub: "Regional Hub 1",
            totalWeightKg: 1250,
            totalVolumeCbm: 15,
            transportMode: "Air/Road",
            estimatedLeadTimeDays: 5
        },
        budgetAnalysis: {
            totalCostUSD: 45000,
            breakdown: [{ pillar: "Logistics", estimatedCostUSD: 25000 }]
        },
        keyInterventions: ["Deploy mobile clinics", "Pre-clear customs for medical kits"]
    };

    return {
        result: mockResult,
        messages: [
            { role: 'user', content: 'Simulate ' + scenario.disease + ' in ' + scenario.country },
            { role: 'assistant', content: mockResult.changeSummary }
        ]
    };
};

export const refineLpiPlanWithAzure = async (scenario: any, message: string, history: ChatMessage[]) => {
    await delay(1000);
    return {
        result: null, // You could update results here if needed
        messages: [...history, { role: 'user', content: message }, { role: 'assistant', content: 'I have noted your request: ' + message + '. Optimization pending.' }]
    };
};
