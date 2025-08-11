import { useParams } from "react-router-dom"
import OrganizationPage from "@/components/OrganizationPage"

export default function OrganizationPublic() {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  
  if (!orgSlug) {
    return <div>Organization not found</div>
  }
  
  return (
    <OrganizationPage 
      organizationSlug={orgSlug}
      showAdminControls={false}
    />
  )
}