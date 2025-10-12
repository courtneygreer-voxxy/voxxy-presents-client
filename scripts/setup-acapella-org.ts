/**
 * Setup Casual Acapella Collective with test account and events
 */

const PRODUCTION_API = 'https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app'

async function setupOrganization() {
  console.log('🎵 Setting up Casual Acapella Collective...\n')

  const orgSlug = 'casual-acapella-collective'
  const orgId = 'LpRTx31RFerqsxavCfbt'

  try {
    // Step 1: Update organization to use test email
    console.log('📧 Step 1: Updating contact email to org-test@voxxypresents.com...')

    const updateOrgResponse = await fetch(
      `${PRODUCTION_API}/api/organizations/${orgId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactEmail: 'org-test@voxxypresents.com'
        })
      }
    )

    if (!updateOrgResponse.ok) {
      throw new Error(`Failed to update organization: ${updateOrgResponse.status}`)
    }

    console.log('✅ Organization email updated\n')

    // Step 2: Create 3 events
    console.log('🎤 Step 2: Creating 3 sample events...\n')

    const events = [
      {
        organizationId: orgId,
        title: 'Sunday Sing Session',
        description: 'Weekly casual practice for all voices - no experience required!',
        fullDescription: 'Join us every Sunday for our relaxed practice session. We work on harmonies, learn new songs, and just enjoy singing together. All skill levels welcome—no auditions, no pressure, just music! Bring your voice and your enthusiasm. We\'ll provide sheet music, warm-up exercises, and plenty of support.',
        category: 'Workshop',
        date: new Date('2025-11-17T15:00:00').toISOString(),
        time: '3:00 PM',
        duration: '2 hours',
        location: 'Brooklyn Community Center',
        address: '123 Harmony St, Brooklyn, NY 11201',
        price: {
          type: 'free',
          amount: 0,
          description: 'Free for all members'
        },
        capacity: 30,
        registrationRequired: true,
        presaleEnabled: false,
        isRecurring: true,
        status: 'published'
      },
      {
        organizationId: orgId,
        title: 'Holiday Showcase at The Brooklyn Lounge',
        description: 'Our first public performance! Holiday classics with an acapella twist.',
        fullDescription: 'Come celebrate the season with us! The Casual Acapella Collective will perform an evening of holiday favorites, from traditional carols to modern classics - all in beautiful acapella harmony. This intimate venue is perfect for our group\'s warm, community vibe. Bring friends and family for a cozy evening of vocal music. Suggested donation supports our spring concert series.',
        category: 'Social',
        date: new Date('2025-12-15T19:00:00').toISOString(),
        time: '7:00 PM',
        duration: '90 minutes',
        location: 'The Brooklyn Lounge',
        address: '456 Bedford Ave, Brooklyn, NY 11249',
        price: {
          type: 'donation',
          amount: 10,
          description: 'Suggested donation $10'
        },
        capacity: 80,
        registrationRequired: true,
        presaleEnabled: true,
        isRecurring: false,
        status: 'published'
      },
      {
        organizationId: orgId,
        title: 'New Member Welcome Session',
        description: 'Curious about acapella? Join us for a casual introduction session!',
        fullDescription: 'Never sung acapella before? This session is for you! We\'ll introduce you to the basics of vocal harmony, show you how our group works, and let you join in on a few easy songs. No singing experience required - just a love of music and willingness to try something new. Meet the group, ask questions, and see if Casual Acapella Collective is right for you. Light refreshments provided.',
        category: 'Workshop',
        date: new Date('2025-11-10T14:00:00').toISOString(),
        time: '2:00 PM',
        duration: '1.5 hours',
        location: 'Brooklyn Community Center',
        address: '123 Harmony St, Brooklyn, NY 11201',
        price: {
          type: 'free',
          amount: 0,
          description: 'Free introduction session'
        },
        capacity: 20,
        registrationRequired: true,
        presaleEnabled: false,
        isRecurring: false,
        status: 'published'
      }
    ]

    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      console.log(`   Creating event ${i + 1}: ${event.title}...`)

      const createEventResponse = await fetch(
        `${PRODUCTION_API}/api/events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        }
      )

      if (!createEventResponse.ok) {
        const errorText = await createEventResponse.text()
        console.error(`   ⚠️  Failed to create event: ${errorText}`)
        continue
      }

      const createdEvent = await createEventResponse.json()
      console.log(`   ✅ Created: ${event.title} (ID: ${createdEvent.id})`)
    }

    console.log('\n🎉 SUCCESS! Setup complete!\n')
    console.log('📋 Summary:')
    console.log(`   Organization: Casual Acapella Collective`)
    console.log(`   Contact Email: org-test@voxxypresents.com`)
    console.log(`   Events Created: 3`)
    console.log(`   Organization ID: ${orgId}\n`)

    console.log('🔗 URLs:')
    console.log(`   Public Page: https://www.voxxypresents.com/${orgSlug}`)
    console.log(`   Admin Page: https://www.voxxypresents.com/${orgSlug}/admin\n`)

    console.log('📝 Next Steps:')
    console.log('   1. Create user account: org-test@voxxypresents.com')
    console.log('   2. In Firebase Console:')
    console.log(`      - Find user with email org-test@voxxypresents.com`)
    console.log(`      - Get their user ID`)
    console.log(`      - Update organization ownerId to that user ID`)
    console.log(`      - Add organization ID to user's organizationIds array`)
    console.log('   3. Log in with org-test@voxxypresents.com')
    console.log('   4. Visit organizer dashboard')
    console.log('   5. Share credentials with customer!\n')

  } catch (error) {
    console.error('\n❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the script
setupOrganization()
  .then(() => {
    console.log('✅ Script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
