/**
 * Email Variables Conversion Test Examples
 *
 * This file demonstrates how the HTML + Variable conversion works
 */

import { backendToFrontend, frontendToBackend, htmlToPlainText, plainTextToHtml } from './emailVariables';

console.log('🧪 EMAIL CONVERSION TESTS\n');

// =============================================================================
// Test 1: Simple HTML to Plain Text
// =============================================================================
console.log('TEST 1: HTML to Plain Text');
console.log('─────────────────────────');

const htmlInput = '<p>Hello World</p><p>This is a test.</p>';
const plainOutput = htmlToPlainText(htmlInput);

console.log('Input (HTML):', htmlInput);
console.log('Output (Plain):', plainOutput);
console.log('Expected:', 'Hello World\n\nThis is a test.');
console.log('✅ Match:', plainOutput === 'Hello World\n\nThis is a test.\n\n');
console.log('');

// =============================================================================
// Test 2: Plain Text to HTML
// =============================================================================
console.log('TEST 2: Plain Text to HTML');
console.log('─────────────────────────');

const plainInput = 'Hello World\n\nThis is a test.';
const htmlOutput = plainTextToHtml(plainInput);

console.log('Input (Plain):', plainInput);
console.log('Output (HTML):', htmlOutput);
console.log('Expected:', '<p>Hello World</p>\n<p>This is a test.</p>');
console.log('');

// =============================================================================
// Test 3: Backend to Frontend (Full Conversion)
// =============================================================================
console.log('TEST 3: Backend to Frontend (HTML + {{vars}} → Plain + [vars])');
console.log('────────────────────────────────────────────────────────────────');

const backendEmail = `<p>Hi {{vendor_name}},</p>
<p>Welcome to {{event_title}} on {{event_date}}!</p>
<p>Your booth is located at {{event_location}}.</p>
<p>Questions? Email {{organization_email}}</p>`;

const frontendEmail = backendToFrontend(backendEmail);

console.log('Backend Input:');
console.log(backendEmail);
console.log('');
console.log('Frontend Output:');
console.log(frontendEmail);
console.log('');
console.log('Expected: Plain text with [variables]');
console.log('');

// =============================================================================
// Test 4: Frontend to Backend (Full Conversion)
// =============================================================================
console.log('TEST 4: Frontend to Backend (Plain + [vars] → HTML + {{vars}})');
console.log('────────────────────────────────────────────────────────────────');

const userInput = `Hi [vendorName],

Welcome to [eventName] on [eventDate]!

Your booth is located at [eventLocation].

Questions? Email [organizationEmail]`;

const backendOutput = frontendToBackend(userInput);

console.log('User Input (Plain + [vars]):');
console.log(userInput);
console.log('');
console.log('Backend Output (HTML + {{vars}}):');
console.log(backendOutput);
console.log('');
console.log('Expected: HTML with {{variables}}');
console.log('');

// =============================================================================
// Test 5: Round Trip (Backend → Frontend → Backend)
// =============================================================================
console.log('TEST 5: Round Trip Conversion');
console.log('──────────────────────────────');

const originalBackend = `<p>Hello {{vendor_name}},</p><p>See you at {{event_title}}!</p>`;
const toFrontend = backendToFrontend(originalBackend);
const backToBackend = frontendToBackend(toFrontend);

console.log('Original Backend:', originalBackend);
console.log('To Frontend:', toFrontend);
console.log('Back to Backend:', backToBackend);
console.log('');

// =============================================================================
// Test 6: Subject Line (Usually no HTML)
// =============================================================================
console.log('TEST 6: Subject Line Conversion');
console.log('────────────────────────────────');

const backendSubject = 'Reminder: {{event_title}} is Tomorrow!';
const frontendSubject = backendToFrontend(backendSubject);
const backendSubject2 = frontendToBackend(frontendSubject);

console.log('Backend Subject:', backendSubject);
console.log('Frontend Subject:', frontendSubject);
console.log('Back to Backend:', backendSubject2);
console.log('');

// =============================================================================
// Test 7: Lists and Bullets
// =============================================================================
console.log('TEST 7: HTML Lists to Bullets');
console.log('──────────────────────────────');

const htmlList = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
const plainList = htmlToPlainText(htmlList);

console.log('HTML List:', htmlList);
console.log('Plain Text:', plainList);
console.log('Expected: • Item 1\\n• Item 2\\n• Item 3');
console.log('');

// =============================================================================
// Summary
// =============================================================================
console.log('═══════════════════════════════════════════════════════════════');
console.log('SUMMARY: How Conversion Works');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('LOADING EMAIL (Backend → Frontend):');
console.log('  1. Strip HTML tags (<p>, <br>, etc.)');
console.log('  2. Convert {{event_title}} → [eventName]');
console.log('  3. User sees: Plain text with [variables]');
console.log('');
console.log('SAVING EMAIL (Frontend → Backend):');
console.log('  1. Convert [eventName] → {{event_title}}');
console.log('  2. Add HTML tags (wrap paragraphs in <p>)');
console.log('  3. Backend receives: HTML with {{variables}}');
console.log('');
console.log('USER EXPERIENCE:');
console.log('  ✅ Never sees HTML tags');
console.log('  ✅ Types plain text');
console.log('  ✅ Uses friendly [variable] names');
console.log('  ✅ Backend stays unchanged');
console.log('');

export {}; // Make this a module
