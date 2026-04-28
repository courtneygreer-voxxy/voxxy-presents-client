import { useState, useEffect } from 'react';
import { Mail, Send, Database, Trash2, AlertCircle, CheckCircle, Loader2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/services/api";
import { useAuth } from '@/contexts/AuthContext';
import EmailPreviewModal from './EmailPreviewModal';

interface EmailItem {
  name: string;
  subject: string;
}

interface EmailCategory {
  name: string;
  description: string;
  count: number;
  emails: EmailItem[];
}

interface EmailCategoriesResponse {
  test_email: string;
  email_categories: EmailCategory[];
  total_emails: number;
}

export default function EmailTestingPanel() {
  const { userProfile } = useAuth();
  const [categories, setCategories] = useState<EmailCategory[]>([]);
  const [testEmail, setTestEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingScheduled, setSendingScheduled] = useState(false);
  const [settingUpData, setSettingUpData] = useState(false);
  const [cleaningData, setCleaningData] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewEmailName, setPreviewEmailName] = useState('');
  const [previewEmailHtml, setPreviewEmailHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadEmailCategories();
  }, []);

  const loadEmailCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: EmailCategoriesResponse = await adminApi.getEmailCategories();
      setCategories(data.email_categories);
      setTestEmail(data.test_email);
      console.log('✅ Loaded email categories:', data);
    } catch (err) {
      console.error('❌ Failed to load email categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load email categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAllEmails = async () => {
    if (!confirm(`This will send all 17 emails to ${testEmail}. Continue?`)) {
      return;
    }

    try {
      setSendingAll(true);
      setError(null);
      setSuccessMessage(null);
      const result = await adminApi.sendAllEmails();
      console.log('✅ Sent all emails:', result);
      setSuccessMessage(`Sending all 17 emails to ${testEmail}. Check your inbox in a few minutes.`);
    } catch (err) {
      console.error('❌ Failed to send all emails:', err);
      setError(err instanceof Error ? err.message : 'Failed to send all emails');
    } finally {
      setSendingAll(false);
    }
  };

  const handleSendScheduledEmails = async () => {
    if (!confirm(`This will send 7 scheduled emails to ${testEmail}. Continue?`)) {
      return;
    }

    try {
      setSendingScheduled(true);
      setError(null);
      setSuccessMessage(null);
      const result = await adminApi.sendScheduledEmails();
      console.log('✅ Sent scheduled emails:', result);
      setSuccessMessage(`Sending 7 scheduled emails to ${testEmail}. Check your inbox in a few minutes.`);
    } catch (err) {
      console.error('❌ Failed to send scheduled emails:', err);
      setError(err instanceof Error ? err.message : 'Failed to send scheduled emails');
    } finally {
      setSendingScheduled(false);
    }
  };

  const handleSetupTestData = async () => {
    try {
      setSettingUpData(true);
      setError(null);
      setSuccessMessage(null);
      const result = await adminApi.setupTestData();
      console.log('✅ Setup test data:', result);
      setSuccessMessage('Test data created successfully');
    } catch (err) {
      console.error('❌ Failed to setup test data:', err);
      setError(err instanceof Error ? err.message : 'Failed to setup test data');
    } finally {
      setSettingUpData(false);
    }
  };

  const handleCleanupTestData = async () => {
    if (!confirm('This will remove all test data. Continue?')) {
      return;
    }

    try {
      setCleaningData(true);
      setError(null);
      setSuccessMessage(null);
      const result = await adminApi.cleanupTestData();
      console.log('✅ Cleaned up test data:', result);
      setSuccessMessage('Test data cleaned up successfully');
    } catch (err) {
      console.error('❌ Failed to cleanup test data:', err);
      setError(err instanceof Error ? err.message : 'Failed to cleanup test data');
    } finally {
      setCleaningData(false);
    }
  };

  const handlePreviewEmail = async (emailName: string, categoryIndex: number, emailIndex: number) => {
    try {
      setPreviewLoading(true);
      setPreviewEmailName(emailName);
      setPreviewModalOpen(true);
      setError(null);

      // Map email names to backend email_type
      const emailType = getEmailTypeFromName(emailName, categoryIndex, emailIndex);
      const result = await adminApi.previewEmail(emailType);
      setPreviewEmailHtml(result.html);
    } catch (err) {
      console.error('❌ Failed to preview email:', err);
      setError(err instanceof Error ? err.message : 'Failed to preview email');
      setPreviewModalOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const getEmailTypeFromName = (emailName: string, categoryIndex: number, emailIndex: number): string => {
    // Category 0: Scheduled emails (1-7)
    if (categoryIndex === 0) {
      return `scheduled_${emailIndex + 1}`;
    }

    // Category 1: Vendor Application Emails
    if (categoryIndex === 1) {
      const types = ['application_confirmation', 'application_approved', 'application_rejected', 'application_waitlist'];
      return types[emailIndex];
    }

    // Category 2: Event Invitation Emails
    if (categoryIndex === 2) {
      const types = ['invitation_vendor'];
      return types[emailIndex];
    }

    // Category 3: Admin/Producer Notification Emails
    if (categoryIndex === 3) {
      const types = ['new_submission', 'payment_confirmed', 'category_changed', 'event_updated', 'event_canceled'];
      return types[emailIndex];
    }

    return '';
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-purple-600 to-blue-500',
      'from-pink-600 to-purple-500',
      'from-blue-600 to-cyan-500',
      'from-green-600 to-teal-500',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
        {/* Header Section */}
        <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-4 lg:p-6">
          <div className="flex items-center gap-3 lg:gap-4 mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 voxxy-accent-tile rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 lg:h-6 lg:w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Email Testing Dashboard</h1>
              <p className="text-sm lg:text-base text-muted-foreground">Test all 17 Voxxy Presents emails</p>
            </div>
          </div>

          {/* Test Email Info with Security Note */}
          <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-200">
                  <strong className="text-foreground">Test Email Recipient:</strong>{' '}
                  <span className="text-blue-300 font-semibold">{testEmail}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All test emails will be sent to your admin email address only. This cannot be changed for security reasons.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4">
            <div className="flex gap-2 items-start">
              <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-200">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-4">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-foreground">17</div>
            <div className="text-sm text-purple-200">Total Emails</div>
          </div>
          <div className="bg-gradient-to-br from-pink-600/20 to-pink-600/10 backdrop-blur-sm border border-pink-400/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-foreground">7</div>
            <div className="text-sm text-pink-200">Scheduled Emails</div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-foreground">10</div>
            <div className="text-sm text-blue-200">Transactional Emails</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleSendAllEmails}
              disabled={sendingAll}
              className="voxxy-btn-cta border-0 h-auto py-3"
            >
              {sendingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send All 17 Emails
                </>
              )}
            </Button>

            <Button
              onClick={handleSendScheduledEmails}
              disabled={sendingScheduled}
              className="bg-gradient-to-r from-pink-600 to-purple-500 hover:from-pink-700 hover:to-purple-600 text-foreground border-0 h-auto py-3"
            >
              {sendingScheduled ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send 7 Scheduled Only
                </>
              )}
            </Button>

            <Button
              onClick={handleSetupTestData}
              disabled={settingUpData}
              variant="outline"
              className="bg-background/10 backdrop-blur-sm border border-border text-foreground hover:bg-background/15 h-auto py-3"
            >
              {settingUpData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Up...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Setup Test Data
                </>
              )}
            </Button>

            <Button
              onClick={handleCleanupTestData}
              disabled={cleaningData}
              variant="outline"
              className="bg-background/10 backdrop-blur-sm border border-red-400/30 text-red-300 hover:bg-red-500/20 h-auto py-3"
            >
              {cleaningData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cleanup Test Data
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Email Categories */}
        {categories.map((category, index) => (
          <div key={index} className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
              </div>
              <Badge className="bg-background/10 backdrop-blur-sm border border-border text-foreground">
                {category.count} emails
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.emails.map((email, emailIndex) => (
                <div
                  key={emailIndex}
                  className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-4 hover:bg-background/10 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getCategoryColor(index)} flex items-center justify-center flex-shrink-0`}>
                      <Mail className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{email.name}</h4>
                      <p className="text-xs text-muted-foreground italic mt-1 truncate">
                        {email.subject}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePreviewEmail(email.name, index, emailIndex)}
                    size="sm"
                    variant="outline"
                    className="w-full mt-3 bg-background/5 border-border text-foreground hover:bg-background/10 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Email Preview Modal */}
        <EmailPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          emailName={previewEmailName}
          emailHtml={previewEmailHtml}
          loading={previewLoading}
        />
      </div>
    </div>
  );
}
