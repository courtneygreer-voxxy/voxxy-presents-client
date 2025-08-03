import React from 'react'
import OrganizationPage from '@/components/OrganizationPage'
import { isFeatureEnabled } from '@/config/environments'

export default function VoxxyPresentsNYC() {
  const customContent = {
    story: `
      <p>
        Voxxy Presents NYC emerged from the underground music scene in 2023, born out of a desire to create 
        authentic connections between emerging artists and passionate music lovers. What started as pop-up shows 
        in unconventional Brooklyn venues has evolved into a curated collective that champions the raw, 
        unfiltered creativity of New York's underground scene.
      </p>
      <p>
        We believe that the most powerful art happens in intimate spaces where barriers between performer and 
        audience dissolve. Our events aren't just concerts—they're communal experiences that celebrate the 
        beautiful chaos of creative expression in all its forms.
      </p>
    `,
    offerings: [
      "Intimate showcases featuring 3-5 carefully curated underground artists",
      "Monthly open mic nights for emerging talent to connect and grow",
      "Pop-up events in unique Brooklyn venues and unconventional spaces",
      "Artist development workshops and networking opportunities",
      "Collaborative projects between musicians, visual artists, and performers",
      "Community-driven events that prioritize authentic artistic expression"
    ]
  }

  return (
    <OrganizationPage
      organizationSlug="voxxy-presents-nyc"
      bannerImage="/placeholder.jpg" // TODO: Add Voxxy Presents banner image
      logoImage="/placeholder-logo.png" // TODO: Add Voxxy Presents logo
      aboutImage="/placeholder.jpg" // TODO: Add Voxxy Presents about image
      showAdminControls={isFeatureEnabled('adminControls')} // Environment-based admin controls
      customContent={customContent}
    />
  )
}