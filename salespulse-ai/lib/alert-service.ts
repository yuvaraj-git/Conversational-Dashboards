export async function getRealtimeAlerts(): Promise<string[]> {
  // Simulate real-time alerts based on metric changes
  const alerts: string[] = []

  // Mock some random alerts to demonstrate real-time functionality
  const possibleAlerts = [
    "🚨 Conversion rate dropped 22% this month - immediate attention needed",
    "📈 Revenue exceeded target by 5.9% - great momentum!",
    "⚠️ Customer acquisition cost increased 18.4% - review marketing spend",
    "✅ Customer satisfaction improved to 4.6/5 - keep up the good work!",
    "📊 Average order value up 8.7% - upselling strategies working",
  ]

  // Randomly select 1-2 alerts to simulate real-time updates
  const numAlerts = Math.floor(Math.random() * 3)
  for (let i = 0; i < numAlerts; i++) {
    const randomAlert = possibleAlerts[Math.floor(Math.random() * possibleAlerts.length)]
    if (!alerts.includes(randomAlert)) {
      alerts.push(randomAlert)
    }
  }

  return alerts
}
