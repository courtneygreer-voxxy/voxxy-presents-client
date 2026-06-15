# V3.0 Migration Documentation

All documentation related to the V3.0 database refactoring and migration.

## Documents

- **[VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md](./VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md)** - Complete technical requirements for V3.0
- **[DEPLOYMENT-CHECKLIST-V3.md](./DEPLOYMENT-CHECKLIST-V3.md)** - Step-by-step deployment guide
- **[DEPRECATIONS.md](./DEPRECATIONS.md)** - List of deprecated code and features
- **[SIGNUP-AUDIT-V3.md](./SIGNUP-AUDIT-V3.md)** - Audit of signup flows vs schema
- **[UI-CHANGES-SCHEMA-VALIDATION.md](./UI-CHANGES-SCHEMA-VALIDATION.md)** - Validation that UI changes match schema
- **[VENDOR_MARKETPLACE_MIGRATION.md](./VENDOR_MARKETPLACE_MIGRATION.md)** - Vendor marketplace migration guide

## Migration Overview

### Key Changes

- Role refactoring: `organizer`→`producer`, `venue_owner`→`vendor`
- Profile renaming: `organizationProfile`→`producerProfile`, `venueOwnerProfile`→`vendorProfile`
- Beta approval removed
- Signup flows updated
- New V3.0 terminology throughout

### Status

- ✅ Phase 0: Security fixes complete
- ✅ Day 1: Database refactoring complete
- 🔄 Day 2: Vendor discovery in progress
