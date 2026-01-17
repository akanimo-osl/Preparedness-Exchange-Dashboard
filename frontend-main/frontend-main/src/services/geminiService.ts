export const generateOracleInsight = async (rankings: any[], formData: any) => {
    const topForwarder = rankings[0]?.name || "a suitable provider";
    const origin = formData?.origin || "the origin";
    const destination = formData?.destination || "the destination";

    return {
        text: `Based on current probability matrices, ${topForwarder} emerges as the optimal choice for the ${origin} to ${destination} corridor. Their reliability score and transit efficiency align with the urgency of this transmission.`,
        provider: "Gemini 1.5 Pro (Mock)"
    };
};
