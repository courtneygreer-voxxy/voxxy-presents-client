import { useParams } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useOrganization } from "@/hooks/useOrganization"
import OrganizationPage from "@/components/OrganizationPage"

export default function OrganizationPublic() {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const { currentUser } = useAuth()
  const { organization } = useOrganization(orgSlug || '')
  
  if (!orgSlug) {
    return <div>Organization not found</div>
  }
  
  // Show admin controls if the current user owns this organization
  const isOwner = !!(currentUser && organization && organization.ownerId === currentUser.uid)
  
  return (
    <OrganizationPage 
      organizationSlug={orgSlug}
      showAdminControls={isOwner}
    />
  )
}