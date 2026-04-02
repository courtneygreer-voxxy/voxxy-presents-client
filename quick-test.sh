#!/bin/bash

# Quick test script to verify universal template functionality
cd /Users/beaulazear/Desktop/voxxy-rails

echo "=== Testing Universal Template Implementation ==="
echo ""

echo "1. Checking last created event..."
bin/rails runner "
event = Event.last
puts \"Event: #{event.name}\"
puts \"Universal Mode: #{event.use_universal_category_template ? '✅ YES' : '❌ NO'}\"
if event.use_universal_category_template?
  puts \"Universal Template: #{event.universal_category_template&.name || 'NONE'}\"
end
puts \"\"
"

echo "2. Checking scheduled emails for last event..."
bin/rails runner "
event = Event.last
scheduled_emails = event.scheduled_emails
  .where.not(vendor_category_id: nil)
  .group(:vendor_category_id)
  .count

puts \"Categories with scheduled emails: #{scheduled_emails.count}\"
scheduled_emails.each do |category_id, count|
  category = VendorCategory.find(category_id)
  puts \"  - #{category.name}: #{count} emails\"
end

if event.use_universal_category_template?
  all_same = scheduled_emails.values.uniq.length == 1
  if all_same
    puts \"\"
    puts \"✅ All categories have same number of emails (universal mode working!)\"
  else
    puts \"\"
    puts \"⚠️  Categories have different email counts (may be an issue)\"
  end
end
"

echo ""
echo "3. Verifying universal template structure..."
bin/rails runner "
template = EmailCampaignTemplate.where(is_universal: true).first
puts \"Universal Template: #{template.name}\"
puts \"Organization: #{template.organization.name}\"
puts \"Email Count: #{template.email_template_items.count}\"
puts \"Template Type: #{template.template_type}\"
puts \"Is Universal: #{template.is_universal}\"
"

echo ""
echo "=== Test Complete ==="
