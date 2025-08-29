// Mock email server for testing frontend integration
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock contact form submission
app.post('/api/email/contact', async (req, res) => {
  console.log('\n📧 Contact Form Submission Received:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Type:', req.body.type);
  console.log('Name:', req.body.name);
  console.log('Email:', req.body.email);
  if (req.body.organizationName) console.log('Organization:', req.body.organizationName);
  if (req.body.description) console.log('Description:', req.body.description);
  console.log('Source:', req.body.source);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate success response
  res.json({
    id: `submission_${Date.now()}`,
    type: req.body.type,
    name: req.body.name,
    email: req.body.email,
    organizationName: req.body.organizationName,
    description: req.body.description,
    source: req.body.source,
    status: 'received',
    submittedAt: new Date().toISOString(),
    emailThreadId: `thread_${Math.random().toString(36).substr(2, 9)}`
  });
});

// Mock email templates endpoint
app.get('/api/email/templates', (req, res) => {
  res.json([
    {
      id: 'contact_inquiry',
      organizationId: 'global',
      name: 'Contact Inquiry Auto-Response',
      type: 'contact_inquiry',
      subject: 'Thank you for contacting Voxxy Presents',
      htmlContent: '<p>Thank you for your message!</p>',
      textContent: 'Thank you for your message!',
      htmlTemplate: '<p>Hi {{name}}, thank you for your message!</p>',
      textTemplate: 'Hi {{name}}, thank you for your message!',
      variables: ['name', 'email'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'beta_request',
      organizationId: 'global', 
      name: 'Beta Request Confirmation',
      type: 'beta_request',
      subject: 'Welcome to the Voxxy Presents Beta Program!',
      htmlContent: '<p>Welcome to the beta program!</p>',
      textContent: 'Welcome to the beta program!',
      htmlTemplate: '<p>Hi {{name}}, welcome to the beta program for {{organizationName}}!</p>',
      textTemplate: 'Hi {{name}}, welcome to the beta program for {{organizationName}}!',
      variables: ['name', 'organizationName'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
});

// Mock contact submissions list
app.get('/api/email/contact', (req, res) => {
  res.json([
    {
      id: 'submission_1',
      type: 'beta_request',
      name: 'John Doe',
      email: 'john@example.com',
      organizationName: 'Cool Community',
      description: 'We run weekly events',
      source: 'contact_page',
      status: 'received',
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      emailThreadId: 'thread_abc123'
    },
    {
      id: 'submission_2', 
      type: 'newsletter_signup',
      name: 'Jane Smith',
      email: 'jane@example.com',
      source: 'contact_page',
      status: 'responded',
      submittedAt: new Date(Date.now() - 7200000).toISOString(),
      respondedAt: new Date(Date.now() - 3600000).toISOString(),
      emailThreadId: 'thread_xyz789'
    }
  ]);
});

// Mock email delivery status
app.get('/api/email/status/:messageId', (req, res) => {
  res.json({
    messageId: req.params.messageId,
    status: 'delivered',
    timestamp: new Date().toISOString(),
    details: 'Message delivered successfully'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Mock Email API',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n🚀 Mock Email API Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📧 Contact Form: POST /api/email/contact`);
  console.log(`📋 Templates: GET /api/email/templates`);
  console.log(`📊 Health: GET /api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Ready to receive contact form submissions! 📨\n');
});