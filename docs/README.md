# 📚 Voxxy Presents Documentation

*Complete guide to building, deploying, and managing the Voxxy Presents platform*

## 🎯 Latest: v1.8.0 Venue Marketplace

**🚀 Now Live**: Complete venue discovery platform with glass morphism UI

---

## 🗂️ Documentation Navigation

### 🚀 **Getting Started**
| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](../README.md) | Project overview and quick setup | Developers |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Coding standards and PR process | Developers |
| [legacy/CUSTOMER-ONBOARDING.md](legacy/CUSTOMER-ONBOARDING.md) | Email system user guide | End users |

### 🛠️ **Development**
| Document | Purpose | Audience |
|----------|---------|----------|
| [development/RUNBOOK.md](development/RUNBOOK.md) | Emergency procedures and troubleshooting | Operations |
| [development/BRANCHING_STRATEGY.md](development/BRANCHING_STRATEGY.md) | Git workflow and branch management | Developers |
| [development/AUTH_IMPLEMENTATION.md](development/AUTH_IMPLEMENTATION.md) | Authentication system details | Developers |
| [development/FIREBASE_SECURITY.md](development/FIREBASE_SECURITY.md) | Database security configuration | DevOps |
| [development/BACKEND_EMAIL_SETUP.md](development/BACKEND_EMAIL_SETUP.md) | Email system implementation | Developers |

### 🚀 **Deployment**
| Document | Purpose | Audience |
|----------|---------|----------|
| [deployment/DEPLOYMENT.md](deployment/DEPLOYMENT.md) | Environment strategy and deployment workflows | DevOps |
| [deployment/RENDER_DEPLOYMENT.md](deployment/RENDER_DEPLOYMENT.md) | Frontend deployment configuration | DevOps |
| [deployment/PLATFORM_INTEGRATION_DEPLOYMENT.md](deployment/PLATFORM_INTEGRATION_DEPLOYMENT.md) | Third-party integrations | DevOps |

### 🎨 **Design System**
| Document | Purpose | Audience |
|----------|---------|----------|
| [design/GLASS_MODAL_DESIGN_SYSTEM.md](design/GLASS_MODAL_DESIGN_SYSTEM.md) | UI component guidelines | Developers |
| [design/STYLING_UPDATE_SESSION.md](design/STYLING_UPDATE_SESSION.md) | Design system documentation | Developers |

### 📦 **Releases**
| Document | Purpose | Audience |
|----------|---------|----------|
| [releases/RELEASE_NOTES_v1.8.0.md](releases/RELEASE_NOTES_v1.8.0.md) | Complete venue marketplace platform | Team |
| [PROJECT_PLAN_VENUE_MARKETPLACE_v1.8.0.md](PROJECT_PLAN_VENUE_MARKETPLACE_v1.8.0.md) | Latest venue marketplace project plan | Team |
| [releases/RELEASE_NOTES_v1.6.0.md](releases/RELEASE_NOTES_v1.6.0.md) | MVP release with glass morphism | Team |
| [releases/v1.5.0.md](releases/v1.5.0.md) | Background customization system | Team |

### 📋 **Archive & Legacy**
| Document | Purpose | Audience |
|----------|---------|----------|
| [archive/](archive/) | Historical development documents | Team |
| [legacy/](legacy/) | Deprecated features and implementations | Team |

---

## 🎯 **Quick Reference**

### 📞 **Emergency Contacts**
- **Team Email**: team@voxxypresents.com
- **Admin Dashboard**: https://www.voxxypresents.com/admin
- **API Health**: https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app/health

### ⚡ **Critical Commands**
```bash
# Emergency rollback
git revert HEAD~1 && git push origin main

# Health check
curl https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app/health

# Staging deployment
git push origin staging && sleep 180 # Wait 3min, then test

# Production deployment  
git checkout main && git merge staging && git push origin main
```

### 🔒 **Admin Access**
- **Username**: team@voxxypresents.com
- **Password**: password123
- **Dashboard**: /admin → Email Analytics tab

---

## 📖 **Documentation Standards**

### File Organization
```
docs/
├── README.md              # This navigation file
└── archived/              # Old or deprecated docs

Root Level:
├── README.md              # Project overview
├── CONTRIBUTING.md        # Development workflow  
├── DEPLOYMENT.md          # Deployment guide
├── RUNBOOK.md            # Operations guide
├── CUSTOMER-ONBOARDING.md # User guide
└── *-STATUS.md           # Current status files
```

### Maintenance
- **Review monthly**: Update status and remove outdated information
- **After major releases**: Update all relevant documentation
- **After incidents**: Update RUNBOOK.md with new procedures
- **New features**: Update CUSTOMER-ONBOARDING.md with new capabilities

---

## 🔍 **Finding Information**

### By Role
- **🆕 New Developer**: README.md → CONTRIBUTING.md → DEVELOPMENT-STATUS.md
- **🚀 DevOps Engineer**: DEPLOYMENT.md → RUNBOOK.md → RENDER_DEPLOYMENT.md
- **👥 End User**: CUSTOMER-ONBOARDING.md
- **🚨 Emergency Response**: RUNBOOK.md → DEPLOYMENT.md
- **📋 Product Manager**: DEVELOPMENT-STATUS.md → CREATE_CLUB_TASKS.md

### By Task
- **🔧 Setting up development**: README.md
- **🚀 Deploying changes**: DEPLOYMENT.md  
- **🐛 Troubleshooting issues**: RUNBOOK.md
- **📊 Understanding features**: CUSTOMER-ONBOARDING.md
- **🔒 Security concerns**: FIREBASE_SECURITY.md
- **📈 Project status**: DEVELOPMENT-STATUS.md

---

**💡 Tip**: Use Cmd+F (or Ctrl+F) to search within documents for specific topics.

---

## 🚀 Next Release: Email & Notifications

**In Development**: Advanced email messaging integration and real-time notification system

**Last Updated**: September 20, 2025
**Maintainer**: Voxxy Presents Team