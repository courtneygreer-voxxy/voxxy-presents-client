/**
 * Add fake subscribers to Casual Acapella Collective
 * Mix of real emails (that won't send) and fake emails
 */

const PRODUCTION_API = 'https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app'
const ORG_ID = 'LpRTx31RFerqsxavCfbt'

const subscribers = [
  // Real emails (user's active emails)
  { name: "Courtney Greer", email: "greerlcourtney@gmail.com" },
  { name: "Courtney L Greer", email: "clg21soccer@gmail.com" },
  { name: "Courtney Voxxy", email: "courtney@heyvoxxy.com" },
  { name: "Voxxy Team", email: "team@voxxypresents.com" },
  { name: "Courtney G", email: "clg21soccer@yahoo.com" },

  // Fake emails that won't send successfully
  { name: "Sarah Johnson", email: "sarah.johnson.fake@example.com" },
  { name: "Michael Chen", email: "mchen.demo@testmail.com" },
  { name: "Emily Rodriguez", email: "emily.r.demo@sample.org" },
  { name: "David Kim", email: "david.kim.test@nowhere.net" },
  { name: "Jessica Martinez", email: "jmartinez.fake@demo.com" },
  { name: "Alex Thompson", email: "alex.t.demo@example.org" },
  { name: "Maria Garcia", email: "maria.garcia.test@sample.net" }
]

async function addSubscribers() {
  console.log('🎵 Adding subscribers to Casual Acapella Collective...\n')
  console.log(`Total subscribers to add: ${subscribers.length}\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < subscribers.length; i++) {
    const subscriber = subscribers[i]
    console.log(`[${i + 1}/${subscribers.length}] Adding: ${subscriber.name} (${subscriber.email})`)

    try {
      const response = await fetch(`${PRODUCTION_API}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'org_subscription', // Special ID for org-level subscriptions
          organizationId: ORG_ID,
          name: subscriber.name,
          email: subscriber.email,
          registrationType: 'subscription',
          subscribeToUpdates: true,
          subscribeToNewsletter: true,
          source: 'website'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`   ⚠️  Failed: ${response.status} - ${errorText}`)
        failCount++
        continue
      }

      const result = await response.json()
      console.log(`   ✅ Added successfully (ID: ${result.registration?.id || 'unknown'})`)
      successCount++

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))

    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : 'Unknown error')
      failCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log(`   ✅ Successfully added: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📧 Total: ${subscribers.length}`)
  console.log('='.repeat(60) + '\n')

  if (successCount > 0) {
    console.log('🎉 Subscribers added successfully!\n')
    console.log('📋 Next steps:')
    console.log('   1. Log in to: https://www.voxxypresents.com')
    console.log('   2. Go to: https://www.voxxypresents.com/casual-acapella-collective/admin')
    console.log('   3. Click on "Subscribers" tab')
    console.log('   4. Use the "Message Subscribers" feature to send emails\n')
    console.log('💡 Note: Real emails will receive messages, fake emails will fail gracefully')
  }
}

// Run the script
addSubscribers()
  .then(() => {
    console.log('✅ Script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
