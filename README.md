# Development Scripts

Utility scripts for Voxxy Presents client development and security.

---

## 📜 Available Scripts

### 🔒 Security Check (`check-security.js`)

Scans your codebase for exposed API keys, secrets, and sensitive data before committing or deploying.

**Usage:**
```bash
node scripts/check-security.js
```

**What it checks for:**
- API keys (Firebase, SendGrid, Google)
- Hardcoded passwords, secrets, and tokens
- Private keys (RSA, SSL certificates)
- Sensitive patterns in code

**Exit codes:**
- `0` - No security issues found ✅
- `1` - Security issues detected ⚠️

**Best Practice:** Run this before:
- Committing to Git
- Creating Pull Requests
- Deploying to production

**Example output:**
```bash
🔍 Scanning Voxxy Presents Client for security issues...

✅ No security issues found!

Scanned for:
  • Firebase API Key
  • Google API Key
  • SendGrid API Key
  • Hardcoded Password
  • Hardcoded Secret
  • Hardcoded Token
  • Private Key
  • RSA Private Key
```

---

## 🏗 Adding New Scripts

When adding new utility scripts:

1. **Place in `/scripts`** directory
2. **Add shebang** for executable scripts: `#!/usr/bin/env node`
3. **Document** in this README with usage examples
4. **Update package.json** if the script should be an npm command
5. **Add to `.gitignore`** if it generates temporary files

**Example package.json command:**
```json
{
  "scripts": {
    "check:security": "node scripts/check-security.js"
  }
}
```

---

## 🔗 Related Documentation

- [Main README](../README.md) - Project overview
- [API Documentation](https://github.com/courtneygreer-voxxy/voxxy-presents-api) - Rails backend API
- [Contributing Guide](../docs/CONTRIBUTING.md) - Development workflow

---

**Last Updated:** November 8, 2024
