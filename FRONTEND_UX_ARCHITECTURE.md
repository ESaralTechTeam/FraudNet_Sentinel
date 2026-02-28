# Frontend & UX Architecture - AI Economic Leakage Detection

## Overview

Modern, accessible, multilingual interface designed for diverse users from rural citizens to government officials.

## Technology Stack

### Core Framework
- **Next.js 14** - React framework with SSR/SSG
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library

### Visualization Libraries
- **D3.js** - Custom fraud network graphs
- **Recharts** - Analytics charts
- **Mapbox GL JS** - Interactive maps
- **React Flow** - Network visualization

### State Management
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state & caching
- **React Hook Form** - Form handling

### Additional Tools
- **i18next** - Internationalization
- **PWA** - Offline support
- **Web Speech API** - Voice input
- **Framer Motion** - Animations

---

## Application Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (citizen)/         # Citizen portal
│   │   ├── (officer)/         # Officer dashboard
│   │   ├── (auditor)/         # Auditor interface
│   │   ├── (admin)/           # Admin panel
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Base components
│   │   ├── forms/             # Form components
│   │   ├── visualizations/    # Charts & graphs
│   │   ├── maps/              # Map components
│   │   └── layouts/           # Layout components
│   ├── lib/
│   │   ├── api/               # API client
│   │   ├── utils/             # Utilities
│   │   └── hooks/             # Custom hooks
│   ├── stores/                # State management
│   └── locales/               # Translations
├── public/
│   ├── icons/
│   ├── images/
│   └── manifest.json          # PWA manifest
└── package.json
```

---

## User Interfaces

### 1. Citizen Portal (Mobile-First)

**Route:** `/citizen`

**Key Features:**
- Simple, large touch targets
- Voice complaint submission
- Local language support
- Offline capability
- Low bandwidth optimization

**Pages:**

**Home (`/citizen`)**
```
┌─────────────────────────────┐
│  [Logo]    [Language ▼]     │
├─────────────────────────────┤
│                             │
│   Welcome, [Name]           │
│                             │
│   ┌─────────────────────┐  │
│   │  Submit Complaint   │  │
│   └─────────────────────┘  │
│                             │
│   ┌─────────────────────┐  │
│   │  Track Complaint    │  │
│   └─────────────────────┘  │
│                             │
│   ┌─────────────────────┐  │
│   │  Check Status       │  │
│   └─────────────────────┘  │
│                             │
│   ┌─────────────────────┐  │
│   │  Help & Support     │  │
│   └─────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**Complaint Submission (`/citizen/complaint/new`)**
```
┌─────────────────────────────┐
│  ← Back                     │
├─────────────────────────────┤
│  Submit Complaint           │
│                             │
│  Choose Method:             │
│  ┌──────┐  ┌──────┐        │
│  │ 🎤   │  │ ✍️   │        │
│  │Voice │  │ Text │        │
│  └──────┘  └──────┘        │
│                             │
│  Complaint Type:            │
│  [Dropdown ▼]              │
│                             │
│  Description:               │
│  [Text Area]               │
│                             │
│  Upload Documents:          │
│  [📎 Attach Files]         │
│                             │
│  Location:                  │
│  [📍 Use Current Location] │
│                             │
│  ┌─────────────────────┐  │
│  │   Submit            │  │
│  └─────────────────────┘  │
└─────────────────────────────┘
```

**Voice Recording Interface**
```
┌─────────────────────────────┐
│  Voice Complaint            │
├─────────────────────────────┤
│                             │
│      ┌─────────┐           │
│      │    🎤   │           │
│      │         │           │
│      │ Recording...        │
│      │  00:45             │
│      └─────────┘           │
│                             │
│  Speak clearly in your      │
│  preferred language         │
│                             │
│  ┌──────┐  ┌──────┐       │
│  │ Stop │  │Cancel│       │
│  └──────┘  └──────┘       │
│                             │
└─────────────────────────────┘
```

**Complaint Tracking (`/citizen/complaint/track`)**
```
┌─────────────────────────────┐
│  Track Complaint            │
├─────────────────────────────┤
│  Complaint ID: #12345       │
│                             │
│  Status: Under Review       │
│                             │
│  Timeline:                  │
│  ● Submitted - Jan 15       │
│  ● Acknowledged - Jan 16    │
│  ○ Under Investigation      │
│  ○ Resolved                 │
│                             │
│  Assigned Officer:          │
│  [Name], [Department]       │
│                             │
│  Expected Resolution:       │
│  Jan 30, 2026              │
│                             │
│  ┌─────────────────────┐  │
│  │  Add Information    │  │
│  └─────────────────────┘  │
└─────────────────────────────┘
```

---

### 2. Officer Dashboard (Desktop/Tablet)

**Route:** `/officer`

**Key Features:**
- Real-time alert feed
- Case management workflow
- Risk assessment tools
- Quick actions
- Performance metrics

**Main Dashboard (`/officer/dashboard`)**
```
┌────────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  Cases  Analytics  [🔔 5]  [Profile ▼] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Welcome, Officer [Name]                District: [XYZ]   │
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Critical │ │  High    │ │  Active  │ │ Resolved │   │
│  │   12     │ │   45     │ │   78     │ │   234    │   │
│  │  Alerts  │ │  Risk    │ │  Cases   │ │  Cases   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  🚨 Critical Alerts                                 │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  ⚠️  High Risk Beneficiary Detected                │ │
│  │      ID: BEN789456 | Risk: 0.92 | 5 min ago       │ │
│  │      [View Details] [Investigate] [Assign]         │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  ⚠️  Fraud Network Identified                      │ │
│  │      15 linked beneficiaries | 2 hours ago         │ │
│  │      [View Network] [Create Case]                  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │  Pending Actions     │  │  District Risk Map       │ │
│  │                      │  │                          │ │
│  │  • 8 Verifications   │  │  [Interactive Map]       │ │
│  │  • 5 Approvals       │  │                          │ │
│  │  • 3 Escalations     │  │  High Risk: 12 blocks    │ │
│  │                      │  │  Medium: 25 blocks       │ │
│  └──────────────────────┘  └──────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Alert Details (`/officer/alert/[id]`)**
```
┌────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                       │
├────────────────────────────────────────────────────────────┤
│  Alert Details - #ALT123456                                │
│                                                            │
│  ┌─────────────────────┐  ┌──────────────────────────┐   │
│  │ Beneficiary Info    │  │  Risk Assessment         │   │
│  │                     │  │                          │   │
│  │ Name: [Name]        │  │  Overall Risk: 0.92      │   │
│  │ ID: BEN789456       │  │  Category: Critical      │   │
│  │ Scheme: PMAY        │  │                          │   │
│  │ District: [XYZ]     │  │  Risk Factors:           │   │
│  │ Amount: ₹50,000     │  │  ━━━━━━━━━━━━━━━━━━━━  │   │
│  │                     │  │  Duplicate: 0.85 ████   │   │
│  │ [View Full Profile] │  │  Anomaly: 0.72   ███    │   │
│  └─────────────────────┘  │  Network: 0.68   ███    │   │
│                            │  Complaint: 0.45 ██     │   │
│  ┌─────────────────────┐  └──────────────────────────┘   │
│  │ Explanation         │                                  │
│  │                     │  ┌──────────────────────────┐   │
│  │ This beneficiary    │  │  Recommended Actions     │   │
│  │ shows high          │  │                          │   │
│  │ similarity to       │  │  ┌────────────────────┐ │   │
│  │ BEN456123 (0.95)    │  │  │  Investigate       │ │   │
│  │                     │  │  └────────────────────┘ │   │
│  │ Shares bank account │  │  ┌────────────────────┐ │   │
│  │ with 3 others       │  │  │  Field Verify      │ │   │
│  │                     │  │  └────────────────────┘ │   │
│  │ Approved in 2 hours │  │  ┌────────────────────┐ │   │
│  │ (avg: 5 days)       │  │  │  Escalate          │ │   │
│  │                     │  │  └────────────────────┘ │   │
│  └─────────────────────┘  │  ┌────────────────────┐ │   │
│                            │  │  Dismiss           │ │   │
│                            │  └────────────────────┘ │   │
│                            └──────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

**Case Management (`/officer/cases`)**
```
┌────────────────────────────────────────────────────────────┐
│  Cases                                                     │
├────────────────────────────────────────────────────────────┤
│  [+ New Case]  [Filter ▼]  [Search...]                    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ID      │ Beneficiary │ Risk  │ Status    │ Actions │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ C12345  │ BEN789456   │ 0.92  │ Open      │ [View]  │ │
│  │ C12344  │ BEN456789   │ 0.85  │ Assigned  │ [View]  │ │
│  │ C12343  │ BEN123789   │ 0.78  │ Review    │ [View]  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [← Previous]  Page 1 of 10  [Next →]                     │
└────────────────────────────────────────────────────────────┘
```

---

### 3. Fraud Network Explorer (Auditor Interface)

**Route:** `/auditor/network`

**Interactive Graph Visualization**
```
┌────────────────────────────────────────────────────────────┐
│  Fraud Network Explorer                                    │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Controls: [Zoom +/-] [Reset] [Export] [Filter ▼]   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌────────────────────────────┐  ┌────────────────────┐  │
│  │                            │  │  Node Details      │  │
│  │         ●───●              │  │                    │  │
│  │        /│\ /│\             │  │  Selected:         │  │
│  │       ● │ ● │ ●            │  │  BEN789456         │  │
│  │        \│/ \│/             │  │                    │  │
│  │         ●───●              │  │  Risk: 0.92        │  │
│  │          \ /               │  │  Connections: 8    │  │
│  │           ●                │  │  Cluster: C1       │  │
│  │          / \               │  │                    │  │
│  │         ●   ●              │  │  Related:          │  │
│  │                            │  │  • BEN456123       │  │
│  │  Legend:                   │  │  • BEN123789       │  │
│  │  ● Beneficiary             │  │  • BEN987654       │  │
│  │  ● Officer                 │  │                    │  │
│  │  ● Bank Account            │  │  [View Profile]    │  │
│  │  ━ Shares Resource         │  │  [Investigate]     │  │
│  │  ━ Approved By             │  │                    │  │
│  │                            │  │  Fraud Pattern:    │  │
│  │                            │  │  Hub (shared bank) │  │
│  └────────────────────────────┘  └────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Network Statistics                                  │ │
│  │  Nodes: 45 | Edges: 78 | Clusters: 3 | Density: 0.4 │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

### 4. Policy Maker Dashboard

**Route:** `/admin/analytics`

**Analytics Overview**
```
┌────────────────────────────────────────────────────────────┐
│  Policy Analytics                                          │
├────────────────────────────────────────────────────────────┤
│  Time Period: [Last 30 Days ▼]  [Export Report]           │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  District Risk Heatmap                               │ │
│  │                                                      │ │
│  │  [Interactive Choropleth Map]                        │ │
│  │                                                      │ │
│  │  Legend: Low ░░ Medium ▒▒ High ▓▓ Critical ██       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │  Leakage Trends      │  │  Scheme Performance      │  │
│  │                      │  │                          │  │
│  │  [Line Chart]        │  │  [Bar Chart]             │  │
│  │                      │  │                          │  │
│  │  ↓ 15% reduction     │  │  PMAY: 92% efficiency    │  │
│  │    this month        │  │  MGNREGA: 88%            │  │
│  └──────────────────────┘  └──────────────────────────┘  │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │  Detection Stats     │  │  Impact Metrics          │  │
│  │                      │  │                          │  │
│  │  Duplicates: 1,234   │  │  Funds Saved: ₹45 Cr    │  │
│  │  Fraud Cases: 456    │  │  Cases Resolved: 789     │  │
│  │  Complaints: 2,345   │  │  Avg Resolution: 12 days │  │
│  └──────────────────────┘  └──────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Component Library

### Core UI Components

**Button Component**
```typescript
// components/ui/button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}
```

**Alert Card**
```typescript
// components/alerts/alert-card.tsx
interface AlertCardProps {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  timestamp: Date;
  actions: Action[];
}
```

**Risk Score Badge**
```typescript
// components/ui/risk-badge.tsx
interface RiskBadgeProps {
  score: number; // 0-1
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

---

## Responsive Design

### Breakpoints
```css
/* Mobile First */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Layout Strategy
- Mobile: Single column, stacked cards
- Tablet: Two columns, side panels
- Desktop: Multi-column, dashboard layout

---

## Accessibility Features

### WCAG 2.1 AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels and roles
- Focus indicators
- Color contrast ratios (4.5:1 minimum)
- Text resizing support
- Alternative text for images

### Inclusive Design
- Large touch targets (44x44px minimum)
- Simple language
- Icon + text labels
- Error prevention & recovery
- Progress indicators
- Confirmation dialogs

---

## Internationalization (i18n)

### Supported Languages
- English
- Hindi (हिंदी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)

### Implementation
```typescript
// locales/en/common.json
{
  "complaint": {
    "submit": "Submit Complaint",
    "track": "Track Complaint",
    "status": "Status"
  },
  "risk": {
    "critical": "Critical Risk",
    "high": "High Risk",
    "medium": "Medium Risk",
    "low": "Low Risk"
  }
}
```

### RTL Support
- Automatic layout flip for RTL languages
- Mirrored icons and navigation

---

## Performance Optimization

### Code Splitting
```typescript
// Dynamic imports for heavy components
const NetworkGraph = dynamic(() => import('@/components/visualizations/network-graph'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### Image Optimization
- Next.js Image component
- WebP format with fallbacks
- Lazy loading
- Responsive images

### Caching Strategy
- Static pages: ISR (Incremental Static Regeneration)
- Dynamic data: SWR (Stale-While-Revalidate)
- API responses: React Query with 5-minute cache

### Bundle Size
- Tree shaking
- Code splitting by route
- Lazy loading non-critical components
- Compression (Gzip/Brotli)

---

## Progressive Web App (PWA)

### Features
- Offline complaint submission
- Background sync
- Push notifications
- Install prompt
- App-like experience

### Service Worker
```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/complaints')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

### Manifest
```json
{
  "name": "Economic Leakage Detection",
  "short_name": "ELD",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [...]
}
```

---

## Voice Interface

### Voice Complaint Submission
```typescript
// lib/voice/recorder.ts
export class VoiceRecorder {
  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    // Recording logic
  }
  
  async stopRecording(): Promise<Blob> {
    // Return audio blob
  }
}
```

### Integration with AWS Transcribe
```typescript
// lib/api/transcribe.ts
export async function transcribeAudio(audioBlob: Blob, language: string) {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('language', language);
  
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}
```

---

## State Management

### Zustand Stores

**Alert Store**
```typescript
// stores/alert-store.ts
interface AlertStore {
  alerts: Alert[];
  fetchAlerts: () => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
  filterBySeverity: (severity: string) => Alert[];
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  fetchAlerts: async () => {
    const data = await api.getAlerts();
    set({ alerts: data });
  },
  // ...
}));
```

**Case Store**
```typescript
// stores/case-store.ts
interface CaseStore {
  cases: Case[];
  activeCase: Case | null;
  createCase: (data: CreateCaseInput) => Promise<void>;
  updateCase: (id: string, data: UpdateCaseInput) => Promise<void>;
  assignCase: (id: string, officerId: string) => Promise<void>;
}
```

---

## API Integration

### API Client
```typescript
// lib/api/client.ts
class APIClient {
  private baseURL: string;
  private token: string;
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    // POST implementation
  }
}

export const api = new APIClient();
```

### React Query Hooks
```typescript
// lib/hooks/use-alerts.ts
export function useAlerts(filters?: AlertFilters) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => api.getAlerts(filters),
    refetchInterval: 30000, // Refetch every 30s
    staleTime: 10000
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCaseInput) => api.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });
}
```

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)
```typescript
// components/ui/button.test.tsx
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });
  
  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Tests (Playwright)
```typescript
// e2e/complaint-submission.spec.ts
test('citizen can submit complaint', async ({ page }) => {
  await page.goto('/citizen/complaint/new');
  await page.fill('[name="description"]', 'Test complaint');
  await page.selectOption('[name="type"]', 'duplicate');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### Accessibility Tests (axe-core)
```typescript
// tests/accessibility.test.tsx
it('has no accessibility violations', async () => {
  const { container } = render(<Dashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Deployment

### Build Configuration
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  images: {
    domains: ['s3.amazonaws.com'],
    formats: ['image/webp', 'image/avif']
  },
  i18n: {
    locales: ['en', 'hi', 'ta', 'te'],
    defaultLocale: 'en'
  },
  env: {
    API_URL: process.env.API_URL
  }
};
```

### AWS Amplify Hosting
- Automatic deployments from Git
- CDN distribution via CloudFront
- SSL certificates
- Custom domain support
- Preview deployments for PRs

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://api.example.gov.in
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
NEXT_PUBLIC_AWS_REGION=ap-south-1
```

---

## Monitoring & Analytics

### Performance Monitoring
- Web Vitals tracking (LCP, FID, CLS)
- Real User Monitoring (RUM)
- Error tracking (Sentry)
- Custom metrics

### User Analytics
- Page views
- User flows
- Feature usage
- Conversion rates
- Session recordings

---

*This frontend architecture provides an accessible, performant, and user-friendly interface for all stakeholders.*
