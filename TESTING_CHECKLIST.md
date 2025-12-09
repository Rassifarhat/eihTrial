# Testing Checklist - Examination Requests

Use this checklist to systematically test all features of the updated application.

---

## ⚙️ Setup

### 1. Environment Configuration
- [ ] Dev server is running: `npm run dev`
- [ ] Server accessible at: http://localhost:3000
- [ ] [.env](.env) has `OPENAI_API_KEY` configured
- [ ] [.env](.env) has `GMAIL_USER` and `GMAIL_PASS` (optional, for email testing)

---

## 🧪 Functional Testing

### Landing Page
- [ ] Page loads without errors
- [ ] Dashboard displays "Medical Request Dashboard" heading
- [ ] "Examination Requests" card is visible and clickable
- [ ] 3 "Coming Soon" cards are visible but not clickable
- [ ] Hover effects work on "Examination Requests" card
- [ ] Mobile layout: Cards stack vertically
- [ ] Desktop layout: 2x2 grid displayed

---

## 🔄 Modal Flow Testing

### Test Set 1: Thiqa Insurer

#### Thiqa + MRI
- [ ] Click "Examination Requests" → Modal opens
- [ ] Step 1: Click "Thiqa" → Advances to Step 2
- [ ] Step 2: Click "MRI" → Advances to Step 3
- [ ] Step 3: Hold mic button, say: "Patient has chronic lower back pain for 6 months, failed conservative treatment, needs MRI lumbar spine"
- [ ] Recording indicator turns red and pulses
- [ ] Release mic → "Recording Saved" appears
- [ ] Optional: Enter email address
- [ ] Click "Generate Request" → Processing starts
- [ ] Step 4: Success screen appears with download button
- [ ] Click "Download PDF"
- [ ] **Verify PDF:**
  - [ ] Opens without errors
  - [ ] Only `mri_check` is ticked (✓)
  - [ ] `ct_check`, `physiotherapy_check`, `admission_check` are unchecked
  - [ ] All 8 text fields are filled with relevant content
  - [ ] Filename: `thiqa-mri-{uuid}.pdf`

#### Thiqa + CT Scan
- [ ] Create new request
- [ ] Select Thiqa → CT Scan
- [ ] Record: "Head trauma from fall, needs CT scan of head to rule out intracranial bleeding"
- [ ] Generate and download
- [ ] **Verify PDF:**
  - [ ] Only `ct_check` is ticked
  - [ ] Other checkboxes unchecked
  - [ ] Filename: `thiqa-ct-{uuid}.pdf`

#### Thiqa + Physiotherapy
- [ ] Create new request
- [ ] Select Thiqa → Physiotherapy
- [ ] Record: "Chronic shoulder pain, rotator cuff injury, failed NSAIDs and rest, needs physiotherapy"
- [ ] Generate and download
- [ ] **Verify PDF:**
  - [ ] Only `physiotherapy_check` is ticked
  - [ ] Filename: `thiqa-physiotherapy-{uuid}.pdf`

#### Thiqa + Admission
- [ ] Create new request
- [ ] Select Thiqa → Admission
- [ ] Record: "Severe pneumonia, patient needs hospital admission for IV antibiotics"
- [ ] Generate and download
- [ ] **Verify PDF:**
  - [ ] Only `admission_check` is ticked
  - [ ] Filename: `thiqa-admission-{uuid}.pdf`

---

### Test Set 2: Daman Insurer

#### Daman + MRI
- [ ] Select Daman → MRI
- [ ] Record: "Knee pain post-injury, suspected meniscus tear, needs MRI knee"
- [ ] **Verify PDF:**
  - [ ] Uses Daman template (different layout from Thiqa)
  - [ ] Only `mri_check` is ticked
  - [ ] Filename: `daman-mri-{uuid}.pdf`

#### Daman + CT Scan
- [ ] Select Daman → CT Scan
- [ ] Record: "Abdominal pain, suspected appendicitis, needs CT abdomen"
- [ ] **Verify PDF:**
  - [ ] Only `ct_check` is ticked
  - [ ] Filename: `daman-ct-{uuid}.pdf`

#### Daman + Physiotherapy
- [ ] Select Daman → Physiotherapy
- [ ] Record: "Post-stroke patient needs physiotherapy for rehabilitation"
- [ ] **Verify PDF:**
  - [ ] Only `physiotherapy_check` is ticked
  - [ ] Filename: `daman-physiotherapy-{uuid}.pdf`

#### Daman + Admission
- [ ] Select Daman → Admission
- [ ] Record: "Diabetic ketoacidosis, needs hospital admission"
- [ ] **Verify PDF:**
  - [ ] Only `admission_check` is ticked
  - [ ] Filename: `daman-admission-{uuid}.pdf`

---

### Test Set 3: Nas Insurer (Text-Only)

⚠️ **Note:** Nas PDFs do NOT have checkbox fields. Test type will appear in the `test` text field only.

#### Nas + MRI
- [ ] Select Nas → MRI
- [ ] Record: "Cervical spine pain with radiculopathy, needs MRI cervical spine"
- [ ] **Verify PDF:**
  - [ ] Uses Nas template (smaller file, different layout)
  - [ ] NO checkboxes visible (expected behavior)
  - [ ] Test type "MRI" written in `test` text field
  - [ ] Filename: `nas-mri-{uuid}.pdf`

#### Nas + CT Scan
- [ ] Select Nas → CT Scan
- [ ] Record: "Chest pain, suspected pulmonary embolism, needs CT chest"
- [ ] **Verify PDF:**
  - [ ] NO checkboxes
  - [ ] "CT Scan" in `test` field
  - [ ] Filename: `nas-ct-{uuid}.pdf`

#### Nas + Physiotherapy
- [ ] Select Nas → Physiotherapy
- [ ] Record: "Frozen shoulder, needs physiotherapy treatment"
- [ ] **Verify PDF:**
  - [ ] NO checkboxes
  - [ ] "Physiotherapy" in `test` field
  - [ ] Filename: `nas-physiotherapy-{uuid}.pdf`

#### Nas + Admission
- [ ] Select Nas → Admission
- [ ] Record: "Acute asthma exacerbation, needs hospital admission"
- [ ] **Verify PDF:**
  - [ ] NO checkboxes
  - [ ] "Admission" in `test` field
  - [ ] Filename: `nas-admission-{uuid}.pdf`

---

## 📧 Email Testing

### Email Delivery (if configured)
- [ ] Configure [.env](.env) with Gmail credentials
- [ ] Create request with email address: `your-email@example.com`
- [ ] Generate PDF
- [ ] **Verify:**
  - [ ] PDF downloads immediately to browser
  - [ ] Email arrives within 1-2 minutes
  - [ ] Email subject: "{Insurer} {TestType} Authorization Request - PDF Generated"
  - [ ] Email contains professional HTML formatting
  - [ ] Email has PDF attachment
  - [ ] Attachment opens correctly
  - [ ] Attachment filename matches downloaded file

### Email Optional Behavior
- [ ] Generate request WITHOUT email → No email sent (expected)
- [ ] Generate request with invalid email (no @) → No email sent
- [ ] Email failure doesn't block PDF download

---

## ✅ Validation Testing

### Step Navigation Validation
- [ ] Cannot advance from Step 1 without selecting insurer
- [ ] Cannot advance from Step 2 without selecting test type
- [ ] Cannot generate PDF without recording audio

### Error Handling
- [ ] Try generating without recording → Error message: "Please complete all required steps..."
- [ ] Try recording without microphone permission → Error: "Microphone access denied"
- [ ] Try with invalid OpenAI key → Error message displayed
- [ ] Close modal mid-flow → Can restart fresh

### Back Button Behavior
- [ ] Step 3 "Back" button → Returns to Step 2
- [ ] Step 2 "Back" button → Returns to Step 1
- [ ] Selections preserved when going back
- [ ] Recording cleared when going back

---

## 🎨 UI/UX Testing

### Visual Appearance
- [ ] All text is readable
- [ ] Colors are appropriate (Thiqa=emerald, Daman=blue, Nas=indigo)
- [ ] Animations are smooth (no jank)
- [ ] Modal centered on screen
- [ ] Modal has proper backdrop blur
- [ ] Icons display correctly
- [ ] Recording button has gradient and pulse effect

### Responsiveness
- [ ] Test on mobile screen (< 768px)
  - [ ] Cards stack vertically
  - [ ] Modal is full-width with padding
  - [ ] Touch recording works (tap and hold)
  - [ ] Text is readable
- [ ] Test on tablet (768px - 1024px)
  - [ ] 2-column grid
  - [ ] Modal sizing appropriate
- [ ] Test on desktop (> 1024px)
  - [ ] 2x2 grid
  - [ ] Modal max-width respected

### Accessibility
- [ ] Tab navigation works through all buttons
- [ ] Modal can be closed with Escape key (if implemented)
- [ ] Focus indicators visible
- [ ] Colors have sufficient contrast

---

## 🐛 Edge Cases

### Audio Recording
- [ ] Very short recording (< 1 second) → Still processes
- [ ] Long recording (> 2 minutes) → Processes successfully
- [ ] Silence recording → GPT generates default content
- [ ] Background noise → Transcription still works

### Network Issues
- [ ] Slow connection → Loading indicator shown
- [ ] API timeout → Error displayed gracefully
- [ ] Offline → Appropriate error message

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Safari (WebKit)
- [ ] Firefox (Gecko)

---

## 📊 Performance Testing

### Load Times
- [ ] Landing page loads in < 2 seconds
- [ ] Modal opens instantly
- [ ] Step transitions are smooth (< 300ms)

### API Response Times
- [ ] Transcription: < 10 seconds
- [ ] PDF generation: < 15 seconds total
- [ ] Download starts immediately after processing

---

## 🔍 Server Log Monitoring

While testing, monitor the terminal running `npm run dev` for:
- [ ] No compilation errors
- [ ] No runtime warnings
- [ ] API logs show correct insurer and test type
- [ ] Checkbox warnings only appear for Nas (expected)
- [ ] Email success/failure logs (if testing email)

---

## 📝 Final Verification

After completing all tests:
- [ ] All 12 insurer/test combinations tested
- [ ] All generated PDFs open without errors
- [ ] Checkboxes behave as expected (Thiqa/Daman ✅, Nas ❌)
- [ ] Email delivery works (if configured)
- [ ] No critical bugs found
- [ ] UI is intuitive and professional

---

## 🚨 Issue Tracking

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| _Example: Modal doesn't close_ | Critical | Fixed | _Fixed in commit abc123_ |
|  |  |  |  |
|  |  |  |  |

---

## ✅ Sign-Off

**Tested By:** ___________________
**Date:** ___________________
**Status:** ☐ Pass ☐ Fail
**Notes:**

---

**Ready for Production?** ☐ Yes ☐ No (see issues above)
