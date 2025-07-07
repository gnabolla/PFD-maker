# Common PDS Errors and Fixes

This guide documents the most common formatting errors in Personal Data Sheets and how to fix them. Understanding these errors will help you create an error-free PDS that complies with CSC requirements.

## Table of Contents

1. [Date Format Errors](#date-format-errors)
2. [Name and Text Formatting Errors](#name-and-text-formatting-errors)
3. [Abbreviation Errors](#abbreviation-errors)
4. [Government ID Format Errors](#government-id-format-errors)
5. [Address Formatting Errors](#address-formatting-errors)
6. [Educational Background Errors](#educational-background-errors)
7. [Work Experience Errors](#work-experience-errors)
8. [Chronological Order Errors](#chronological-order-errors)
9. [Incomplete Information Errors](#incomplete-information-errors)
10. [Signature and Photo Errors](#signature-and-photo-errors)

## Date Format Errors

### Error: Incorrect Date Format

**How it appears:**
- "15/01/2024" (DD/MM/YYYY)
- "2024-01-15" (YYYY-MM-DD)
- "Jan 15, 2024" (Month DD, YYYY)
- "15-01-24" (DD-MM-YY)

**CSC Requirement:** All dates must be in MM/DD/YYYY format

**Manual Fix:**
1. Identify the current format
2. Rearrange to MM/DD/YYYY
3. Ensure month and day have leading zeros
4. Use 4-digit year

**Examples:**
- ❌ Wrong: "15/01/2024" 
- ✅ Correct: "01/15/2024"
- ❌ Wrong: "1/5/2024"
- ✅ Correct: "01/05/2024"

**Auto-Fix Available:** ✅ Yes - Click "Fix Date Format" button

**Prevention Tips:**
- Set your computer's date format to MM/DD/YYYY
- Use the date picker provided in the form
- Double-check all dates before submission

### Error: Invalid Date Values

**How it appears:**
- "13/45/2024" (Invalid day)
- "00/15/2024" (Invalid month)
- "02/30/2024" (February 30th doesn't exist)

**Manual Fix:**
1. Verify the correct date from source documents
2. Check calendar for valid date ranges
3. Correct the values

**Auto-Fix Available:** ❌ No - Requires manual verification

## Name and Text Formatting Errors

### Error: Names Not in All Capitals

**How it appears:**
- "dela Cruz" instead of "DELA CRUZ"
- "Juan Santos" instead of "JUAN SANTOS"
- "ma. teresa" instead of "MA. TERESA"

**CSC Requirement:** All names must be in CAPITAL LETTERS

**Manual Fix:**
1. Select the text
2. Convert to uppercase
3. Ensure proper spacing

**Examples:**
- ❌ Wrong: "Juan dela Cruz Jr."
- ✅ Correct: "JUAN DELA CRUZ JR."

**Auto-Fix Available:** ✅ Yes - Click "Convert to Uppercase"

**Prevention Tips:**
- Turn on CAPS LOCK when entering names
- Use the form's auto-capitalization feature
- Review all name fields before saving

### Error: Incorrect Name Order

**How it appears:**
- First name entered in surname field
- Middle name missing or in wrong field
- Name extension (Jr., III) included in first name

**Manual Fix:**
1. Identify correct name components
2. Move to appropriate fields:
   - Surname (family name)
   - First Name (given name)
   - Middle Name
   - Name Extension (Jr., Sr., III, etc.)

**Auto-Fix Available:** ❌ No - Requires manual correction

## Abbreviation Errors

### Error: Abbreviated Institution Names

**How it appears:**
- "UST" instead of "University of Santo Tomas"
- "St. Mary's Elem. School" instead of "Saint Mary's Elementary School"
- "DOH" instead of "Department of Health"
- "BSU" instead of "Batangas State University"

**CSC Requirement:** Write ALL names in FULL, no abbreviations

**Manual Fix:**
1. Identify all abbreviations
2. Research full official name
3. Replace with complete name

**Common Abbreviations to Avoid:**

| Abbreviation | Full Name |
|--------------|-----------|
| St. | Saint |
| Mt. | Mount |
| Elem. | Elementary |
| Natl. | National |
| Univ. | University |
| Dept. | Department |
| Corp. | Corporation |
| Inc. | Incorporated |
| Engr. | Engineer |
| Atty. | Attorney |

**Auto-Fix Available:** ⚠️ Partial - System suggests common expansions

**Prevention Tips:**
- Research official names before entering
- Check institution websites for proper names
- Avoid using period (.) in names

### Error: Abbreviated Addresses

**How it appears:**
- "Brgy. 123" instead of "Barangay 123"
- "Q.C." instead of "Quezon City"
- "Mla." instead of "Manila"
- "Ave." instead of "Avenue"

**Manual Fix:**
1. Write complete words
2. Spell out all parts of address
3. Include all address components

**Auto-Fix Available:** ✅ Yes - For common address abbreviations

## Government ID Format Errors

### Error: Incorrect GSIS ID Format

**Correct Format:** ##-#######-#

**Common Errors:**
- Missing hyphens: "12345678901"
- Wrong hyphen placement: "123-45678-901"
- Letters included: "BP1234567890"

**Manual Fix:**
1. Remove all non-numeric characters
2. Count digits (should be 11)
3. Insert hyphens: XX-XXXXXXX-X

**Auto-Fix Available:** ✅ Yes

### Error: Incorrect SSS Number Format

**Correct Format:** ##-#######-#

**Common Errors:**
- Using spaces instead of hyphens
- Including "SSS" prefix
- Wrong number of digits

**Manual Fix:**
1. Extract numbers only
2. Format as: XX-XXXXXXX-X

**Auto-Fix Available:** ✅ Yes

### Error: Incorrect TIN Format

**Correct Format:** ###-###-###-###

**Common Errors:**
- No hyphens: "123456789000"
- Wrong grouping: "1234-567-890"
- Missing leading zeros: "12-345-678-0"

**Manual Fix:**
1. Ensure 12 digits total
2. Group by threes
3. Add hyphens

**Auto-Fix Available:** ✅ Yes

### Error: Incorrect PhilHealth Number Format

**Correct Format:** ##-#########-#

**Common Errors:**
- Old format used
- Missing digits
- Wrong hyphen placement

**Manual Fix:**
1. Use 12-digit format
2. Place hyphens correctly

**Auto-Fix Available:** ✅ Yes

## Address Formatting Errors

### Error: Incomplete Address Components

**How it appears:**
- Missing barangay
- No zip code
- Province not specified
- Street name omitted

**CSC Requirement:** All address fields must be complete

**Manual Fix:**
1. Gather complete address information
2. Fill in all required fields:
   - House/Block/Lot No.
   - Street
   - Subdivision/Village
   - Barangay
   - City/Municipality
   - Province
   - ZIP Code

**Auto-Fix Available:** ❌ No - Requires complete information

### Error: Wrong ZIP Code Format

**How it appears:**
- "1100-A" (letters included)
- "11000" (too many digits)
- "110" (too few digits)

**Correct Format:** 4 digits only

**Manual Fix:**
1. Verify correct ZIP code
2. Use exactly 4 digits
3. Remove any letters or special characters

**Auto-Fix Available:** ⚠️ Partial - Validates format only

## Educational Background Errors

### Error: Incomplete School Years

**How it appears:**
- "1990-94" instead of "1990-1994"
- "'90-'94" instead of "1990-1994"
- Missing "From" or "To" years

**Manual Fix:**
1. Use complete 4-digit years
2. Fill both From and To fields
3. Ensure chronological order

**Auto-Fix Available:** ✅ Yes - For year format

### Error: Wrong Degree Format

**How it appears:**
- "BS CS" instead of "Bachelor of Science in Computer Science"
- "BSBA major in HRM" format inconsistency
- Abbreviated degree names

**Manual Fix:**
1. Write complete degree title
2. Include "major in" if applicable
3. No abbreviations

**Auto-Fix Available:** ⚠️ Partial - Common degrees only

### Error: Missing Graduation Details

**How it appears:**
- Both "Year Graduated" and "Highest Level/Units Earned" filled
- Neither field filled
- "N/A" in required fields

**Manual Fix:**
1. If graduated: Fill "Year Graduated" only
2. If not graduated: Fill "Highest Level/Units Earned" only
3. One field must have data, not both

**Auto-Fix Available:** ❌ No - Requires user decision

## Work Experience Errors

### Error: Overlapping Employment Dates

**How it appears:**
- Two jobs with same time period
- End date before start date
- Future dates for past employment

**Manual Fix:**
1. Review employment records
2. Correct date ranges
3. Ensure no overlaps unless concurrent

**Auto-Fix Available:** ❌ No - Requires verification

### Error: Missing Salary Information

**How it appears:**
- Blank salary field
- "Confidential" entered
- Salary range instead of exact amount

**CSC Requirement:** Exact monthly salary required

**Manual Fix:**
1. Enter exact monthly salary
2. Use numbers only (no commas or peso sign)
3. For daily rate: Calculate monthly equivalent

**Examples:**
- ❌ Wrong: "₱25,000.00"
- ✅ Correct: "25000"
- ❌ Wrong: "20000-25000"
- ✅ Correct: "22500" (use actual salary)

**Auto-Fix Available:** ✅ Yes - Removes formatting

### Error: Incomplete Position Titles

**How it appears:**
- "Admin Asst" instead of full title
- "IT Staff" - too generic
- Using internal codes like "JO-123"

**Manual Fix:**
1. Use complete official position title
2. No abbreviations
3. Match appointment/contract

**Auto-Fix Available:** ❌ No

## Chronological Order Errors

### Error: Work Experience Not in Reverse Order

**How it appears:**
- Oldest job listed first
- Random order
- Current job not at top

**CSC Requirement:** Most recent employment first

**Manual Fix:**
1. List current/latest job first
2. Continue backwards chronologically
3. End with earliest employment

**Auto-Fix Available:** ✅ Yes - "Sort by Date" button

### Error: Education Not in Proper Order

**How it appears:**
- Graduate studies before college
- Vocational mixed with academic
- Missing education levels

**Correct Order:**
1. Elementary
2. Secondary
3. Vocational (if any)
4. College
5. Graduate Studies

**Manual Fix:**
1. Follow standard order
2. Include all levels attended
3. Don't skip levels

**Auto-Fix Available:** ❌ No

## Incomplete Information Errors

### Error: Using "N/A" Incorrectly

**How it appears:**
- "N/A" in required fields
- Blank instead of "N/A" where allowed
- "None" instead of leaving blank

**When to use "N/A":**
- Name Extension (if none)
- Spouse fields (if single)
- Optional government IDs

**When NOT to use "N/A":**
- Required name fields
- Mandatory dates
- Required addresses

**Manual Fix:**
1. Remove "N/A" from required fields
2. Provide actual information
3. Leave truly optional fields blank

**Auto-Fix Available:** ⚠️ Partial - Removes from required fields

### Error: Missing Character References

**How it appears:**
- Less than 3 references
- Incomplete reference information
- Family members as references

**CSC Requirement:** 3 non-relative references

**Manual Fix:**
1. List exactly 3 references
2. Complete all information:
   - Full name
   - Complete address
   - Contact number
3. Cannot be relatives

**Auto-Fix Available:** ❌ No

## Signature and Photo Errors

### Error: Invalid Photo Specifications

**How it appears:**
- Wrong size (not 4.5cm x 3.5cm)
- Poor quality/blurry
- Informal photo (not passport-style)
- Wrong background color

**CSC Requirements:**
- Size: 4.5cm x 3.5cm (passport size)
- Recent photo (within 6 months)
- White background
- Formal attire
- Front facing

**Manual Fix:**
1. Have new photo taken at photo studio
2. Request passport-size format
3. Scan at high quality (300 DPI)
4. Ensure white background

**Auto-Fix Available:** ⚠️ Partial - Can crop/resize only

### Error: Missing or Invalid Signature

**How it appears:**
- Typed name instead of signature
- Signature outside box
- Digital signature not clear
- Using initials only

**Manual Fix:**
1. Sign on white paper with black ink
2. Scan at high resolution
3. Crop to signature only
4. Upload as image

**Auto-Fix Available:** ❌ No

### Error: Missing Right Thumbmark

**How it appears:**
- Field left blank
- Low quality impression
- Using other fingers
- Smudged thumbmark

**Manual Fix:**
1. Use black ink pad
2. Press right thumb firmly
3. Ensure clear ridges visible
4. Scan at high resolution

**Auto-Fix Available:** ❌ No

## Quick Reference: Auto-Fix Availability

| Error Type | Auto-Fix Available | Fix Method |
|------------|-------------------|------------|
| Date Format | ✅ Yes | Automatic conversion |
| Name Capitalization | ✅ Yes | Convert to uppercase |
| Common Abbreviations | ⚠️ Partial | Suggestions provided |
| Government ID Format | ✅ Yes | Format correction |
| Address Abbreviations | ✅ Yes | Expand common terms |
| Year Format | ✅ Yes | Convert to 4-digit |
| Salary Format | ✅ Yes | Remove symbols/commas |
| Work Experience Order | ✅ Yes | Sort by date |
| Required Field N/A | ⚠️ Partial | Remove invalid entries |
| Photo Resize | ⚠️ Partial | Crop and resize only |

## Best Practices for Error Prevention

1. **Before Starting:**
   - Gather all documents
   - Verify all information
   - Check official names

2. **While Filling:**
   - Save frequently
   - Use provided formats
   - Review each section

3. **Before Submission:**
   - Run validation check
   - Fix all red errors
   - Review warnings
   - Print preview

4. **Common Checklist:**
   - [ ] All dates in MM/DD/YYYY
   - [ ] All names in CAPITALS
   - [ ] No abbreviations
   - [ ] Complete addresses
   - [ ] Correct ID formats
   - [ ] Reverse chronological order
   - [ ] 3 complete references
   - [ ] Passport photo attached
   - [ ] Signature uploaded

Remember: Taking time to enter information correctly the first time saves hours of corrections later!