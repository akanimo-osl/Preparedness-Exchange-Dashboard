# MoScripts Integration into Camino

## 📁 File Structure

```
your-camino-app/
├── app/
│   └── api/
│       └── ai-insights/
│           └── route.ts           # API endpoint for MoScript triggers
├── lib/
│   └── moscripts/
│       └── index.ts               # MoScript runtime + registry
├── components/
│   └── AIInsights.tsx             # UI component for displaying results
└── app/
    └── alerts/[id]/
        └── page.tsx               # Example usage in alert page
```

## 🔧 Integration Steps

### 1. Copy Files to Your Project

```bash
# From camino-integration/ to your Camino project
cp -r app/api/ai-insights your-camino-app/app/api/
cp -r lib/moscripts your-camino-app/lib/
cp components/AIInsights.tsx your-camino-app/components/
```

### 2. Update Imports Path Aliases

Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 3. Use in Your Components

**Simple Usage:**
```tsx
import AIInsights from '@/components/AIInsights';

export default function YourPage() {
  return (
    <AIInsights 
      trigger="onAlertReceived"
      data={{ 
        disease: 'Mpox', 
        location: 'DRC', 
        cases: 142 
      }}
    />
  );
}
```

**Manual Control:**
```tsx
<AIInsights 
  trigger="onAlertReceived"
  data={alertData}
  autoLoad={false}  // User triggers manually
/>
```

### 4. Available Triggers

Current placeholder triggers:

- `onAlertReceived` - When WHO alert arrives
  - Inputs: `disease`, `location`, `cases`, `population`
  - Returns: Risk analysis + Forecast

Add more when AI team delivers their MoScripts.

## 🔄 When AI Team Delivers

### Step 1: Replace Placeholders

In `lib/moscripts/index.ts`:

```typescript
// Remove placeholder scripts
clearRegistry();

// Import real MoScripts from AI team
import diseaseRisk from '@/lib/moscripts/scripts/diseaseRiskAnalyzer';
import forecaster from '@/lib/moscripts/scripts/outbreakForecaster';

registerMoScript(diseaseRisk);
registerMoScript(forecaster);
```

### Step 2: Add Their Adapter

Copy their updated `adapters/` folder:

```bash
cp -r ai-team-delivery/adapters lib/moscripts/
```

### Step 3: Environment Variables

Add to `.env.local`:

```env
# AI Endpoint Configuration
YOUR_AI_ENDPOINT=https://their-endpoint.com/infer
YOUR_AI_KEY=your-api-key-here
```

### Step 4: Test

```bash
# Run development server
npm run dev

# Visit any page using AIInsights component
# Verify real AI responses appear
```

## 🎯 Trigger Naming Convention

Use descriptive event names:

- `onAlertReceived` - New WHO alert
- `onDataUpdate` - Time-series data update
- `onResourceRequest` - Logistics query
- `onPatientAdmitted` - Hospital event
- `onLabResult` - Test result processed

## 📊 Response Format

MoScripts return structured results:

```typescript
{
  id: 'disease-risk-001',
  name: 'Disease Risk Analyzer',
  result: {
    // AI-specific data structure
    riskLevel: 'high',
    spreadProbability: 85,
    actions: [...]
  },
  voiceLine: '⚠️ HIGH RISK detected...',
  timestamp: '2024-01-10T...'
}
```

## 🔥 Benefits Now Active

✅ **Zero AI coupling** - Swap models anytime  
✅ **Multiple perspectives** - All registered AIs respond  
✅ **Graceful fallback** - Placeholders until delivery  
✅ **Type-safe** - Full TypeScript contracts  
✅ **Voice output** - Natural language summaries

## 📦 What AI Team Will Deliver

- Updated `adapters/` with real endpoint
- 3-5 MoScripts in `scripts/` folder
- Updated registry imports
- Environment variables list
- Test documentation

## 🧪 Testing Placeholders Now

1. Run your app: `npm run dev`
2. Navigate to any page using `<AIInsights />`
3. See placeholder responses (500ms delay simulates AI)
4. Verify UI renders correctly
5. Check voice lines appear

Placeholders return mock data to validate integration flow.

---

**Status:** Ready for AI team delivery  
**Integration:** Complete, placeholders active  
**Next:** Await real MoScripts from collaborator
