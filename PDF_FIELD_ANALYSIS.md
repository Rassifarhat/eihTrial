# PDF Field Analysis Report

**Date:** 2025-12-08
**PDFs Analyzed:** thiqa-fillable.pdf, daman-fillable.pdf, nas-fillable.pdf

---

## 🚨 CRITICAL FINDINGS

### NAS PDF Missing Checkboxes
The `nas-fillable.pdf` file is **MISSING ALL 4 CHECKBOX FIELDS**:
- ❌ `mri_check`
- ❌ `ct_check`
- ❌ `physiotherapy_check`
- ❌ `admission_check`

**Impact:** Cannot use checkbox-based test type selection with NAS forms.

**Options:**
1. **Add checkboxes to NAS PDF** (requires PDF editing tool like Adobe Acrobat)
2. **Use text field workaround** (write test type to a text field instead)
3. **Disable NAS from test type selection** (only allow Thiqa/Daman for now)

---

## Field Comparison Table

| Field Name | Thiqa | Daman | Nas | Type | Notes |
|------------|-------|-------|-----|------|-------|
| `complaint` | ✅ | ✅ | ✅ | Text | All match |
| `etiology_duration` | ✅ | ✅ | ✅ | Text | All match |
| `conservative_result` | ✅ | ✅ | ✅ | Text | All match |
| `physical_exam` | ✅ | ✅ | ✅ | Text | All match |
| `goal` | ✅ | ✅ | ✅ | Text | All match |
| `icd10` | ✅ | ✅ | ✅ | Text | All match |
| `test` | ✅ | ✅ | ✅ | Text | All match |
| `test_code` | ✅ | ✅ | ✅ | Text | All match |
| **Checkboxes** ||||| |
| `mri_check` | ✅ | ✅ | ❌ | Checkbox | Missing in Nas |
| `ct_check` | ✅ | ✅ | ❌ | Checkbox | Missing in Nas |
| `physiotherapy_check` | ✅ | ✅ | ❌ | Checkbox | Missing in Nas |
| `admission_check` | ✅ | ✅ | ❌ | Checkbox | Missing in Nas |

---

## Detailed Field Lists

### Thiqa PDF (16 fields)
**Text Fields (13):**
- complaint
- etiology_duration
- conservative_result
- physical_exam
- goal
- icd10
- test
- test_code
- History *(extra field, not in others)*
- Text Box 1 *(extra field)*
- Text Box 2 *(extra field)*
- Text Box 3 *(extra field)*

**Checkboxes (4):**
- mri_check ✅
- ct_check ✅
- physiotherapy_check ✅
- admission_check ✅

---

### Daman PDF (16 fields)
**Text Fields (12):**
- complaint
- etiology_duration
- conservative_result
- physical_exam
- goal
- icd10
- test
- test_code
- title1 *(extra field, not in others)*
- title 2 *(extra field, note space in name)*
- Text Box 1 *(extra field)*
- Text Box 2 *(extra field)*

**Checkboxes (4):**
- mri_check ✅
- ct_check ✅
- physiotherapy_check ✅
- admission_check ✅

---

### Nas PDF (10 fields)
**Text Fields (10):**
- complaint
- etiology_duration
- conservative_result
- physical_exam
- goal
- icd10
- test
- test_code
- conservative *(extra field, not in others)*
- goal_label *(extra field, not in others)*

**Checkboxes (0):**
- ❌ NO CHECKBOXES

---

## Recommended Strategy

### Option 1: Two-Tier Approach (RECOMMENDED)
**Tier 1 - Full Feature (Thiqa & Daman):**
- Support all 4 test types with checkbox selection
- Full validation
- User sees all options

**Tier 2 - Text-Only (Nas):**
- Write test type to `test` field (already done by GPT)
- No checkbox selection
- Show note: "Nas forms use text-based test selection"

**Implementation:**
```typescript
const hasCheckboxes = insurer !== 'Nas';

if (hasCheckboxes) {
  // Fill checkboxes for Thiqa/Daman
  if (data.mri_check) form.getCheckBox('mri_check').check();
  // ... etc
} else {
  // Nas: test type already written to 'test' field by GPT
  console.log('Nas form uses text-based test selection');
}
```

---

### Option 2: Add Checkboxes to Nas PDF
**Pros:**
- Consistent behavior across all insurers
- Cleaner code

**Cons:**
- Requires PDF editing software
- May need access to original Nas form template
- Could violate form integrity if official template

---

### Option 3: Disable Nas Test Type Selection
**Pros:**
- Simple implementation
- No special cases

**Cons:**
- Removes Nas support (defeats purpose)
- User confusion

---

## Common Fields (Safe to Use)

These 8 text fields exist in **ALL 3 PDFs** with **IDENTICAL NAMES**:
✅ `complaint`
✅ `etiology_duration`
✅ `conservative_result`
✅ `physical_exam`
✅ `goal`
✅ `icd10`
✅ `test`
✅ `test_code`

**Mapping Code (No Changes Needed):**
```typescript
const textFieldMappings = [
  { pdfField: "complaint", dataKey: "complaint" },
  { pdfField: "etiology_duration", dataKey: "etiology_duration" },
  { pdfField: "conservative_result", dataKey: "conservative_result" },
  { pdfField: "physical_exam", dataKey: "physical_exam" },
  { pdfField: "goal", dataKey: "goal" },
  { pdfField: "icd10", dataKey: "icd10" },
  { pdfField: "test", dataKey: "test" },
  { pdfField: "test_code", dataKey: "test_code" },
];
```

---

## Action Items

1. ✅ **Field extraction complete**
2. 🔄 **Decision needed:** How to handle Nas checkboxes?
3. ⏳ **Update backend:** Implement two-tier checkbox logic (recommended)
4. ⏳ **Update UI:** Show indicator for Nas limitations (optional)
5. ⏳ **Test:** Verify all combinations work as expected

---

## Notes

- **Extra fields** (History, Text Box 1, title1, etc.) are not critical - they're unused or label fields
- **Field name consistency** is excellent for the 8 core text fields
- **Checkbox naming** is identical between Thiqa and Daman (good!)
- **Nas PDF** appears to be an older template version without checkbox support
