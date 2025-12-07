# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application that fills medical PDF forms (specifically Thiqa Authorization Request forms for UAE health insurance) using voice input. Users record their clinical case description, which is transcribed and processed to automatically populate a fillable PDF.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Tech Stack
- Next.js 16 (App Router) with TypeScript
- React 19
- Tailwind CSS 4
- OpenAI API (Whisper for transcription, GPT-4.1-mini for data extraction)
- pdf-lib for PDF manipulation

### Application Flow

1. **Voice Recording** ([app/page.tsx](app/page.tsx))
   - Client-side recording using MediaRecorder API
   - Supports multiple audio formats (webm, ogg, mp4, wav)
   - Hold-to-record interface with visual feedback

2. **API Processing** ([app/api/process-voice/route.ts](app/api/process-voice/route.ts))
   - Receives audio file via multipart/form-data
   - Transcribes audio using OpenAI Whisper (`gpt-4o-mini-transcribe`)
   - Extracts structured clinical data using GPT-4.1-mini with JSON mode
   - Fills PDF template using pdf-lib
   - Saves filled PDFs to `public/filled/` directory
   - Returns PDF as downloadable blob

3. **PDF Template**
   - Template: `public/thiqaForm_fillable.pdf`
   - Filled forms saved to: `public/filled/thiqa-form-{uuid}.pdf`

### Key Components

**ClinicalFormData Interface** ([app/api/process-voice/route.ts:12-22](app/api/process-voice/route.ts#L12-L22)):
- Defines the structured data extracted from clinical descriptions
- Fields: complaint, etiology_duration, conservative_result, physical_exam, goal, icd10, test, test_check, test_code

**PDF Field Mappings** ([app/api/process-voice/route.ts:100-109](app/api/process-voice/route.ts#L100-L109)):
- Maps ClinicalFormData keys to PDF form field names
- Fields must match the fillable field names in the PDF template exactly

### Environment Variables

Required in `.env`:
```
OPENAI_API_KEY=sk-proj-...
```

## Important Implementation Details

### Audio Format Handling
The app automatically detects supported audio formats using `MediaRecorder.isTypeSupported()` and prefers webm with opus codec. The API route handles multiple formats dynamically.

### PDF Form Field Names
When modifying PDF processing, use the debug logging to see available field names:
```typescript
const fields = form.getFields();
console.log("Available PDF fields:", fields.map(f => f.getName()));
```

### AI Prompt Engineering
The system prompt in [app/api/process-voice/route.ts:47-70](app/api/process-voice/route.ts#L47-L70) contains critical instructions for generating medically appropriate content. Key requirements:
- Conservative treatments must end with "failure to address pain"
- Physical exam needs 4-5 findings
- Goal must reference failed conservative treatment
- Always use JSON response format with temperature 0.3

### File Storage
Generated PDFs are saved to the filesystem in `public/filled/` to persist across requests. The file path is returned in the `X-File-Path` header but the PDF bytes are sent directly in the response.

## Path Aliases

TypeScript is configured with `@/*` aliasing to the root directory ([tsconfig.json:21-23](tsconfig.json#L21-L23)).
Critical Tool Usage Rules
Context7 - Always Use for Documentation Lookups
MANDATORY: When the user asks about any library, API, framework, or tool:

ALWAYS use the Context7 MCP tool FIRST to look up fresh, up-to-date documentation
DO NOT rely solely on your training data for library/API information
Context7 provides the most current documentation and should be your primary source

When to use Context7:

User asks "how do I use [library]?"
User asks about specific API methods or functions
User asks about configuration or setup for any tool
User mentions a specific library version
User asks about best practices for a framework
ANY question about external libraries, frameworks, or APIs

Example triggers:

"How do I use Next.js 15?"
"What's the API for React Query?"
"How do I configure Tailwind?"
"Show me how to use Prisma"
"What are the methods in axios?"

🚨 CRITICAL: Context7 Quality Requirements
ALWAYS Check Resource Dates - NO EXCEPTIONS
When using Context7, you MUST be thorough and quality-focused:
MANDATORY DATE CHECKING:

ALWAYS check the date/timestamp of EVERY resource Context7 returns
PRIORITIZE resources in this exact order:

First: Resources from the last 7 days (most recent)
Second: Resources from the last 30 days (recent)
Third: Resources from the last 6 months (relatively current)
Last Resort: Older resources (ONLY if nothing newer exists)


NEVER return outdated information when newer resources are available
ALWAYS mention the date of the resource you're using in your response

REJECT OUTDATED/LOW-QUALITY RESOURCES:

❌ IGNORE resources older than 1 year if newer alternatives exist
❌ NEGLECT "lame" information (vague, incomplete, or deprecated content)
❌ SKIP resources that don't clearly indicate their publication/update date
❌ DISCARD resources that contradict newer official documentation
❌ AVOID third-party tutorials when official docs are available and recent

Take Your Time - Thoroughness Over Speed
DO NOT RUSH Context7 Lookups:

Multiple Searches if Needed: If the first Context7 search returns outdated or unclear results, make additional searches with:

More specific queries
Version numbers (e.g., "React 18" not just "React")
Date constraints (e.g., "Next.js 15 2024")


Cross-Reference: When you find documentation, verify it's the most current by:

Checking if a newer version exists
Looking for "latest", "current", or version numbers
Confirming the date is recent


Be Patient: Taking an extra 10-20 seconds to find the RIGHT documentation is better than quickly returning WRONG or OUTDATED information

Quality Checklist - MUST FOLLOW
Before responding to the user with Context7 results:
✅ Did I check the date of the resource?
✅ Is this the most recent information available?
✅ Did I search for more recent alternatives?
✅ Is this from official/authoritative sources?
✅ Does this match the version the user is asking about?
✅ Would I trust this information for production code?
If you answer NO to any of these, DO MORE CONTEXT7 SEARCHES until you can answer YES to all.
Example of Correct Context7 Usage
❌ BAD - Shallow Usage:
User: "How do I use React Query v5?"
Claude: [one Context7 search, returns first result from 2022]
Claude: "Here's how to use React Query..." [gives outdated v3 info]
✅ GOOD - Thorough Usage:
User: "How do I use React Query v5?"
Claude: [Context7 search: "React Query v5"]
Claude: [Checks dates - finds results from 2023]
Claude: [Context7 search: "React Query v5 2024"]
Claude: [Finds official docs updated 2 weeks ago]
Claude: "Based on the official React Query documentation (updated Dec 2024), 
         here's how to use v5..." [gives current, accurate information]
When Context7 Returns Multiple Results
ALWAYS:

Review ALL results - don't just use the first one
Compare dates - prioritize the newest
Check sources - official docs > blog posts > forums
Verify consistency - if results conflict, search again with more specific terms
Mention the date - tell the user when the info is from

Red Flags - When to Search Again
If you see any of these, make another Context7 search:

🚩 Date is older than 6 months for fast-moving libraries
🚩 Information seems incomplete or vague
🚩 Resource doesn't specify version numbers
🚩 Source is unofficial (Stack Overflow, random blog) when official docs should exist
🚩 Information contradicts what you'd expect from recent versions
🚩 No date/timestamp is visible on the resource

Summary: Context7 Usage Standards
PRIORITY ORDER:

⚡ RECENCY: Newest information first (check dates!)
🏛️ AUTHORITY: Official docs over third-party content
🎯 SPECIFICITY: Exact version/feature info over general info
✅ QUALITY: Complete, clear information over vague content

NEVER:

❌ Return the first result without checking its date
❌ Use outdated information when newer exists
❌ Skip date checking to save time
❌ Trust unofficial sources over official docs
❌ Give up after one search - be persistent!

next-devtools-mcp - Always Use for Testing
MANDATORY: When testing Next.js applications:

ALWAYS use the next-devtools-mcp tool for testing
DO NOT create your own test implementations
DO NOT use other testing approaches unless explicitly requested
The next-devtools-mcp provides the correct testing environment and tools

When to use next-devtools-mcp:

User asks to test their Next.js app
User asks to run tests
User asks to check if something works
User wants to verify functionality
User asks about test results

Workflow Example
User asks: "How do I fetch data in Next.js 15?"
Correct response (with quality checks):

Call Context7 MCP: "Next.js 15 data fetching"
CHECK DATES of returned resources
If results are old (> 6 months):

Call Context7 again: "Next.js 15 data fetching 2024"
Call Context7 again: "Next.js 15 server components data fetching"


Find official Next.js docs from last 30 days
Verify information matches Next.js 15 (not 13 or 14)
Provide answer based on the MOST RECENT documentation from Context7
MENTION THE DATE: "Based on Next.js 15 documentation (updated November 2024)..."
If implementation is needed and testing is requested, use next-devtools-mcp

Incorrect response:
❌ Providing information from training data without checking Context7
❌ Using Context7 once, getting old results, and not searching again
❌ Not checking the date of the documentation
❌ Returning information about Next.js 13 when asked about Next.js 15
❌ Using unofficial blog posts when official docs are available
❌ Creating manual test files instead of using next-devtools-mcp
❌ Being satisfied with "lame" or vague documentation
Configuration
Both MCPs are configured in your Claude Code MCP configuration file:

Context7: Requires API key (set in environment variable)
next-devtools-mcp: Ready to use for Next.js testing

Remember
Context7 Usage

Context7 = Fresh Documentation (ALWAYS FIRST)
CHECK DATES - Recent info only (7 days > 30 days > 6 months)
BE THOROUGH - Multiple searches if needed
REJECT OUTDATED - Never return old info when new exists
MENTION DATES - Always tell user when info is from
QUALITY OVER SPEED - Take time to find the RIGHT documentation

next-devtools-mcp Usage

next-devtools-mcp = Testing Next.js (ALWAYS FOR TESTS)
DO NOT create your own test implementations

Fallback

Your training data = Only as fallback if MCPs fail completely


🎯 Quick Decision Tree
User asks about a library/API/framework:

➡️ Use Context7 to search
➡️ Check the date of results
➡️ Is it recent (< 30 days)?

✅ YES → Verify it's authoritative → Use it
❌ NO → Search again with date/version constraints


➡️ Still getting old results?

Search with "2025" or "latest version"
Search official docs specifically
Try 2-3 different search terms


➡️ Respond with the MOST RECENT, HIGHEST QUALITY info found

Remember: It's better to spend 30 seconds finding the right documentation than to give the user outdated information that wastes their time!