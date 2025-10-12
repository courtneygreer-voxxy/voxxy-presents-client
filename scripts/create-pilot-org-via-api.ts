/**
 * Script to create Casual Acapella Collective via production API
 * Uses the deployed voxxy-presents-api on Google Cloud Run
 */

const PRODUCTION_API = 'https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app'

async function createPilotOrganization() {
  console.log('🚀 Creating Casual Acapella Collective via production API...\n')

  const organizationData = {
    name: "Casual Acapella Collective",
    slug: "casual-acapella-collective",
    description: "A relaxed weekly acapella group for singers who want to share their passion in a casual, community-focused environment with opportunities to perform at local venues.",
    background: "Casual Acapella Collective was born from a simple desire: to create a space where singers can come together without the pressure of a full-time commitment. Founded by Trisha Tyagi, this group is for anyone who loves acapella and wants to connect with like-minded people in a welcoming, low-key setting. We believe that singing together should be fun, fulfilling, and accessible to everyone who shares the passion. Meeting weekly on weekends, we're building a community of voices that support each other, grow together, and seek out small performance opportunities to share our joy of music with others.",
    contactEmail: "courtneygreer@voxxyai.com",
    socialLinks: {
      website: "",
      instagram: "",
    },
    settings: {
      defaultLocation: "TBD",
      defaultAddress: "TBD",
      theme: {
        primaryColor: "#8B5CF6",
        backgroundColor: "#1F2937"
      }
    },
    ownerId: "pilot-demo-owner"
  }

  try {
    // First check if it already exists
    console.log(`🔍 Checking if organization '${organizationData.slug}' already exists...`)
    const checkResponse = await fetch(
      `${PRODUCTION_API}/api/organizations/${organizationData.slug}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (checkResponse.ok) {
      const existing = await checkResponse.json()
      console.log(`\n✅ Organization '${organizationData.slug}' already exists!`)
      console.log(`   Organization ID: ${existing.id}`)
      console.log(`   Name: ${existing.name}`)
      console.log(`   Owner: ${existing.ownerId}`)
      console.log(`   Contact: ${existing.contactEmail}\n`)
      console.log(`🔗 URLs:`)
      console.log(`   Public Page: https://www.voxxypresents.com/${organizationData.slug}`)
      console.log(`   Admin Dashboard: https://www.voxxypresents.com/${organizationData.slug}/admin\n`)
      return
    }

    // Create the organization
    console.log(`✨ Creating new organization via API...`)
    const createResponse = await fetch(
      `${PRODUCTION_API}/api/organizations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organizationData)
      }
    )

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`API request failed (${createResponse.status}): ${errorText}`)
    }

    const result = await createResponse.json()

    console.log(`\n🎉 SUCCESS! Casual Acapella Collective created in production database!\n`)
    console.log(`📋 Organization Details:`)
    console.log(`   Name: ${organizationData.name}`)
    console.log(`   Slug: ${organizationData.slug}`)
    console.log(`   Organization ID: ${result.id}`)
    console.log(`   Owner Email: ${organizationData.contactEmail}`)
    console.log(`   Owner ID: ${organizationData.ownerId}\n`)

    console.log(`🔗 URLs:`)
    console.log(`   Public Page: https://www.voxxypresents.com/${organizationData.slug}`)
    console.log(`   Admin Dashboard: https://www.voxxypresents.com/${organizationData.slug}/admin\n`)

    console.log(`📝 Next Steps:`)
    console.log(`   1. Visit the public page to verify it loads correctly`)
    console.log(`   2. Log in with courtneygreer@voxxyai.com to access admin dashboard`)
    console.log(`   3. Customize branding, colors, and upload logo/images`)
    console.log(`   4. Create first event to test the full workflow`)
    console.log(`   5. When ready, transfer ownership to Trisha Tyagi\n`)

    console.log(`🔄 To transfer ownership later:`)
    console.log(`   - Create a user account for Trisha Tyagi in Firebase`)
    console.log(`   - Set her role to 'organizer' and betaStatus to 'approved'`)
    console.log(`   - Update this organization's ownerId to her user ID`)
    console.log(`   - Update contactEmail to her email address\n`)

  } catch (error) {
    console.error('❌ Failed to create pilot organization:')
    console.error(error)
    throw error
  }
}

// Run the script
createPilotOrganization()
  .then(() => {
    console.log('✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
