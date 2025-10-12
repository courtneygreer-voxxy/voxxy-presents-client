/**
 * Script to link Casual Acapella Collective to courtneygreer@voxxyai.com
 * This updates both the organization's ownerId and the user's organizationIds array
 */

const PRODUCTION_API = 'https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app'

async function linkOrgToUser() {
  console.log('🔗 Linking Casual Acapella Collective to courtneygreer@voxxyai.com...\n')

  const email = 'courtneygreer@voxxyai.com'
  const orgSlug = 'casual-acapella-collective'

  try {
    // Step 1: Get the organization
    console.log(`📋 Step 1: Fetching organization '${orgSlug}'...`)
    const orgResponse = await fetch(
      `${PRODUCTION_API}/api/organizations/${orgSlug}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!orgResponse.ok) {
      throw new Error(`Failed to fetch organization: ${orgResponse.status}`)
    }

    const org = await orgResponse.json()
    console.log(`✅ Found organization: ${org.name} (ID: ${org.id})`)

    // Step 2: Find user by email
    console.log(`\n👤 Step 2: Finding user with email ${email}...`)
    const userResponse = await fetch(
      `${PRODUCTION_API}/api/users?email=${encodeURIComponent(email)}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!userResponse.ok) {
      console.log(`⚠️  User API endpoint may not exist. Trying alternative method...`)
      console.log(`\n📝 MANUAL STEPS REQUIRED:`)
      console.log(`\n1. Log into Firebase Console:`)
      console.log(`   https://console.firebase.google.com/project/voxxy-presents/firestore/data`)
      console.log(`\n2. Navigate to 'users' collection`)
      console.log(`\n3. Find the user document with email: ${email}`)
      console.log(`\n4. Copy the user document ID`)
      console.log(`\n5. Update the organization:`)
      console.log(`   - Go to 'organizations' collection`)
      console.log(`   - Find document ID: ${org.id}`)
      console.log(`   - Update 'ownerId' field to the user document ID`)
      console.log(`\n6. Update the user:`)
      console.log(`   - Go back to the user document`)
      console.log(`   - Add organization ID '${org.id}' to 'organizationIds' array`)
      console.log(`   - If 'organizationIds' doesn't exist, create it as an array`)
      console.log(`\n✅ After making these changes, the organization will appear in the organizer dashboard!\n`)
      return
    }

    const users = await userResponse.json()
    if (!users || users.length === 0) {
      throw new Error(`No user found with email ${email}`)
    }

    const user = users[0]
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)

    // Step 3: Update organization ownerId
    console.log(`\n🔄 Step 3: Updating organization owner...`)
    const updateOrgResponse = await fetch(
      `${PRODUCTION_API}/api/organizations/${org.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: user.id })
      }
    )

    if (!updateOrgResponse.ok) {
      throw new Error(`Failed to update organization: ${updateOrgResponse.status}`)
    }

    console.log(`✅ Updated organization ownerId to ${user.id}`)

    // Step 4: Update user's organizationIds array
    console.log(`\n🔄 Step 4: Adding organization to user's organizationIds...`)

    const currentOrgIds = user.organizationIds || []
    if (!currentOrgIds.includes(org.id)) {
      const updatedOrgIds = [...currentOrgIds, org.id]

      const updateUserResponse = await fetch(
        `${PRODUCTION_API}/api/users/${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationIds: updatedOrgIds })
        }
      )

      if (!updateUserResponse.ok) {
        console.log(`⚠️  Could not automatically update user. Manual step required:`)
        console.log(`\nFirebase Console: https://console.firebase.google.com/project/voxxy-presents/firestore/data/users/${user.id}`)
        console.log(`Add organization ID '${org.id}' to the 'organizationIds' array field\n`)
      } else {
        console.log(`✅ Added organization to user's organizationIds array`)
      }
    } else {
      console.log(`ℹ️  Organization already in user's organizationIds`)
    }

    console.log(`\n🎉 SUCCESS! Organization is now linked to user!\n`)
    console.log(`📋 Summary:`)
    console.log(`   Organization: ${org.name}`)
    console.log(`   Organization ID: ${org.id}`)
    console.log(`   Owner: ${user.email}`)
    console.log(`   Owner ID: ${user.id}\n`)
    console.log(`🔗 View your club:`)
    console.log(`   Organizer Dashboard: https://www.voxxypresents.com/organizer/dashboard`)
    console.log(`   Public Page: https://www.voxxypresents.com/${org.slug}`)
    console.log(`   Admin Page: https://www.voxxypresents.com/${org.slug}/admin\n`)

  } catch (error) {
    console.error('❌ Failed to link organization to user:')
    console.error(error)
    console.error('\n')
    process.exit(1)
  }
}

// Run the script
linkOrgToUser()
  .then(() => {
    console.log('✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
