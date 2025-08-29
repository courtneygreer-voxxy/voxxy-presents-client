# 📚 Voxxy Presents Documentation

*Complete guide to building, deploying, and managing the Voxxy Presents platform*

---

## 🗂️ Documentation Navigation

### 🚀 **Getting Started**
| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](../README.md) | Project overview and quick setup | Developers |
| [CUSTOMER-ONBOARDING.md](../CUSTOMER-ONBOARDING.md) | Email system user guide | End users |
| [DEVELOPMENT-STATUS.md](../DEVELOPMENT-STATUS.md) | Current project status and next steps | Team |

### 🛠️ **Development**
| Document | Purpose | Audience |
|----------|---------|----------|
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Coding standards and PR process | Developers |
| [DEPLOYMENT.md](../DEPLOYMENT.md) | Environment strategy and deployment workflows | DevOps |
| [BRANCHING_STRATEGY.md](../BRANCHING_STRATEGY.md) | Git workflow and branch management | Developers |

### 🚨 **Operations**
| Document | Purpose | Audience |
|----------|---------|----------|
| [RUNBOOK.md](../RUNBOOK.md) | Emergency procedures and troubleshooting | Operations |
| [DEBUGGING-STATUS.md](../DEBUGGING-STATUS.md) | Common debugging scenarios | Support |

### 🏗️ **Architecture**
| Document | Purpose | Audience |
|----------|---------|----------|
| [BACKEND_EMAIL_SETUP.md](../BACKEND_EMAIL_SETUP.md) | Email system technical implementation | Developers |
| [FIREBASE_SECURITY.md](../FIREBASE_SECURITY.md) | Database security configuration | DevOps |
| [AUTH_IMPLEMENTATION.md](../AUTH_IMPLEMENTATION.md) | Authentication system details | Developers |

### 📋 **Project Management**
| Document | Purpose | Audience |
|----------|---------|----------|
| [CREATE_CLUB_TASKS.md](../CREATE_CLUB_TASKS.md) | Club creation feature requirements | Product |
| [DEVELOPMENT_CONTEXT.md](../DEVELOPMENT_CONTEXT.md) | Project context and decisions | Team |
| [BRANCH_PROTECTION_SETUP.md](../BRANCH_PROTECTION_SETUP.md) | Repository protection configuration | DevOps |

### 🚀 **Deployment**
| Document | Purpose | Audience |
|----------|---------|----------|
| [RENDER_DEPLOYMENT.md](../RENDER_DEPLOYMENT.md) | Frontend deployment configuration | DevOps |

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

**Last Updated**: August 29, 2025  
**Maintainer**: Voxxy Presents Team