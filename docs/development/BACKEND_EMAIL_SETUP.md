# Backend Email API Setup Guide

## Overview
The frontend email system requires a backend API to handle actual email sending. This guide shows you how to set up the backend endpoints that the frontend expects.

## Required Backend API Endpoints

### 1. Contact Form Endpoint
```
POST /api/email/contact
```

**Request Body:**
```json
{
  "type": "beta_request" | "newsletter_signup" | "general_contact",
  "name": "string",
  "email": "string", 
  "organizationName": "string (optional)",
  "description": "string (optional)",
  "source": "contact_page"
}
```

**Response:**
```json
{
  "id": "submission-id",
  "status": "received",
  "emailThreadId": "thread-id (optional)",
  "submittedAt": "2024-01-01T00:00:00Z"
}
```

### 2. Email Sending Endpoint
```
POST /api/email/send
```

**Request Body:**
```json
{
  "to": ["recipient@example.com"],
  "subject": "Email subject",
  "htmlContent": "<html>...</html>",
  "textContent": "Plain text content",
  "templateId": "template-id (optional)",
  "templateData": { "name": "John", "company": "Acme" }
}
```

### 3. Templates Endpoint
```
GET /api/email/templates
GET /api/email/templates/type/contact_inquiry
```

## Quick Backend Implementation (Node.js + Express)

### 1. Install Dependencies
```bash
npm install express @sendgrid/mail cors dotenv
```

### 2. Basic Server Setup
```javascript
// server.js
const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Contact form endpoint
app.post('/api/email/contact', async (req, res) => {
  try {
    const { type, name, email, organizationName, description } = req.body;
    
    // Send confirmation email to user
    const userEmail = {
      to: email,
      from: 'team@voxxyai.com', // Must be verified in SendGrid
      subject: getSubjectForType(type),
      html: generateEmailTemplate(type, { name, organizationName, description }),
      text: generateTextTemplate(type, { name, organizationName, description })
    };
    
    // Send notification to team
    const teamEmail = {
      to: 'team@voxxyai.com',
      from: 'team@voxxyai.com',
      subject: `New ${type} from ${name}`,
      html: `
        <h2>New ${type.replace('_', ' ')} submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${organizationName ? `<p><strong>Organization:</strong> ${organizationName}</p>` : ''}
        ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
      `,
      text: `New ${type} from ${name}\nEmail: ${email}${organizationName ? `\nOrganization: ${organizationName}` : ''}${description ? `\nDescription: ${description}` : ''}`
    };
    
    // Send both emails
    await Promise.all([
      sgMail.send(userEmail),
      sgMail.send(teamEmail)
    ]);
    
    // Return success response
    res.json({
      id: `submission_${Date.now()}`,
      type,
      name,
      email,
      organizationName,
      description,
      source: 'contact_page',
      status: 'received',
      submittedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    });
  }
});

// Helper functions
function getSubjectForType(type) {
  switch (type) {
    case 'beta_request':
      return 'Welcome to the Voxxy Presents Beta Program!';
    case 'newsletter_signup':
      return 'Welcome to Voxxy Presents Updates!';
    case 'general_contact':
      return 'Thank you for contacting Voxxy Presents';
    default:
      return 'Thank you for contacting Voxxy Presents';
  }
}

function generateEmailTemplate(type, data) {
  const { name, organizationName, description } = data;
  
  switch (type) {
    case 'beta_request':
      return `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #7c3aed;">Welcome to Beta!</h1>
            <p>Hi ${name},</p>
            <p>Thank you for your interest in the Voxxy Presents Beta Program for <strong>${organizationName}</strong>!</p>
            <p>We've received your request and will get back to you within 48 hours.</p>
            <p>Best regards,<br>The Voxxy Presents Team</p>
          </body>
        </html>
      `;
    case 'newsletter_signup':
      return `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Welcome to Updates!</h1>
            <p>Hi ${name},</p>
            <p>Thanks for subscribing to Voxxy Presents updates! You'll be the first to know about new features and community building tips.</p>
            <p>Best regards,<br>The Voxxy Presents Team</p>
          </body>
        </html>
      `;
    default:
      return `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #7c3aed;">Thank You!</h1>
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to the Voxxy Presents team! We've received your message and will get back to you within 24 hours.</p>
            <p>Best regards,<br>The Voxxy Presents Team</p>
          </body>
        </html>
      `;
  }
}

function generateTextTemplate(type, data) {
  const { name, organizationName } = data;
  
  switch (type) {
    case 'beta_request':
      return `Hi ${name},\n\nThank you for your interest in the Voxxy Presents Beta Program for ${organizationName}!\n\nWe've received your request and will get back to you within 48 hours.\n\nBest regards,\nThe Voxxy Presents Team`;
    case 'newsletter_signup':
      return `Hi ${name},\n\nThanks for subscribing to Voxxy Presents updates! You'll be the first to know about new features and community building tips.\n\nBest regards,\nThe Voxxy Presents Team`;
    default:
      return `Hi ${name},\n\nThank you for reaching out to the Voxxy Presents team! We've received your message and will get back to you within 24 hours.\n\nBest regards,\nThe Voxxy Presents Team`;
  }
}

// Basic templates endpoint (for future use)
app.get('/api/email/templates', (req, res) => {
  res.json([
    {
      id: 'contact_inquiry',
      name: 'Contact Inquiry Auto-Response',
      type: 'contact_inquiry',
      subject: 'Thank you for contacting Voxxy Presents',
      isActive: true
    },
    {
      id: 'beta_request', 
      name: 'Beta Request Confirmation',
      type: 'beta_request',
      subject: 'Welcome to the Voxxy Presents Beta Program!',
      isActive: true
    },
    {
      id: 'newsletter_signup',
      name: 'Newsletter Signup Confirmation', 
      type: 'newsletter_signup',
      subject: 'Welcome to Voxxy Presents Updates!',
      isActive: true
    }
  ]);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email API server running on port ${PORT}`);
});
```

### 3. Environment Variables
Create `.env` file:
```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
PORT=3001
```

### 4. Start the Backend
```bash
node server.js
```

## Testing the Full Flow

### 1. Start Backend API
```bash
# In your backend directory
node server.js
# Should see: "Email API server running on port 3001"
```

### 2. Start Frontend
```bash
# In your Voxxy frontend directory
npm run dev
# Should see: "Local: http://localhost:5173"
```

### 3. Test Contact Form
1. Open `http://localhost:5173/contact`
2. Fill out the Beta Access form with:
   - Your name
   - Your email
   - Organization name
   - Description
3. Click "Request Paid Beta Access"
4. Check for success message
5. Check your email for the confirmation

### 4. Check SendGrid Activity
- Go to SendGrid Dashboard → Activity
- You should see the sent emails there

## Frontend Environment Configuration

Make sure your frontend `.env` file points to the backend:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENVIRONMENT=development
```

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure backend has `cors()` middleware
2. **SendGrid authentication failed**: Verify API key and sender email
3. **Network errors**: Ensure backend is running on port 3001
4. **Email not received**: Check spam folder, verify sender email in SendGrid

### Debug Steps:
1. Check browser console for frontend errors
2. Check backend console for API errors
3. Verify SendGrid Activity Feed
4. Test backend endpoints directly with curl/Postman

This setup will give you a fully functional email system for testing locally!