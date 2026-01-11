/**
 * MoScripts Runtime for Camino
 * 
 * This module integrates the MoScript consciousness architecture
 * into Camino's health intelligence platform.
 */

export type MoScript = {
  id: string;
  name: string;
  trigger: string;
  inputs: string[];
  logic: (inputs: Record<string, any>) => Promise<any>;
  voiceLine?: (result: any) => string;
  sass?: boolean;
};

// Registry will be populated by AI team
let moRegistry: MoScript[] = [];

/**
 * Register a MoScript
 */
export function registerMoScript(script: MoScript) {
  moRegistry.push(script);
}

/**
 * Execute all MoScripts matching a trigger
 */
export async function runTrigger(
  trigger: string, 
  inputs: Record<string, any>
) {
  const matches = moRegistry.filter(script => script.trigger === trigger);
  
  if (matches.length === 0) {
    console.warn(`No MoScripts registered for trigger: ${trigger}`);
    return [];
  }

  const results = [];

  for (const script of matches) {
    try {
      const result = await script.logic(inputs);
      const voice = script.voiceLine ? script.voiceLine(result) : null;
      
      results.push({ 
        id: script.id,
        name: script.name,
        result,
        voiceLine: voice,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`MoScript ${script.id} failed:`, error);
      results.push({
        id: script.id,
        name: script.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
}

/**
 * Get all registered MoScripts
 */
export function listMoScripts() {
  return moRegistry.map(s => ({
    id: s.id,
    name: s.name,
    trigger: s.trigger,
    inputs: s.inputs
  }));
}

/**
 * Clear registry (for testing)
 */
export function clearRegistry() {
  moRegistry = [];
}

// Placeholder MoScripts until AI team delivers
// These return mock data to demonstrate the flow

registerMoScript({
  id: 'placeholder-risk-001',
  name: 'Disease Risk Analyzer (Placeholder)',
  trigger: 'onAlertReceived',
  inputs: ['disease', 'location', 'cases', 'population'],
  
  logic: async ({ disease, location, cases, population }) => {
    // Mock AI response
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      riskLevel: cases > 100 ? 'high' : 'medium',
      spreadProbability: Math.min(95, (cases / population) * 100000),
      actions: [
        'Deploy rapid response teams',
        'Establish isolation facilities',
        'Initiate contact tracing'
      ],
      urgency: 'days',
      confidence: 'placeholder-data'
    };
  },
  
  voiceLine: (result) => 
    `⚠️ ${result.riskLevel.toUpperCase()} RISK detected. ` +
    `Spread probability: ${result.spreadProbability.toFixed(1)}%. ` +
    `Priority: ${result.actions[0]}`,
  
  sass: true
});

registerMoScript({
  id: 'placeholder-forecast-001',
  name: 'Outbreak Forecaster (Placeholder)',
  trigger: 'onAlertReceived',
  inputs: ['disease', 'cases'],
  
  logic: async ({ cases }) => {
    // Mock AI response
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
      peakDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      day7Forecast: Math.round(cases * 1.8),
      day14Forecast: Math.round(cases * 2.5),
      day30Forecast: Math.round(cases * 1.2),
      interventionScore: 6,
      confidence: 'placeholder-data'
    };
  },
  
  voiceLine: (result) => 
    `📊 Peak expected: ${result.peakDate}. ` +
    `7-day forecast: ${result.day7Forecast} cases. ` +
    `Intervention score: ${result.interventionScore}/10.`
});
