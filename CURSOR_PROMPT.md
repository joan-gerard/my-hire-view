# Cursor AI Prompt: Build Personalized Recruiter Landing Page Platform

## Project Overview
I need you to help me build a web application that generates unique, personalized landing pages for job applications. Each page will display a role-specific CV (PDF) and a targeted video pitch (YouTube unlisted), accessible via unique shareable links that I can send to recruiters.

## Current Setup Status
✅ Next.js 16 project initialized
✅ Supabase account created with new project (but no database tables or auth configured yet)
✅ Vercel account ready
✅ Node.js installed

## Tech Stack Requirements
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Vercel Blob Storage (for PDFs)
- **Video Hosting**: YouTube (unlisted videos - user will provide embed URLs)
- **Deployment**: Vercel

## Core Features Required

### 1. Database Schema (Supabase)
First, help me set up the Supabase database with the following schema:

**Applications Table:**
```sql
- id: uuid (primary key, auto-generated)
- slug: text (unique, URL-safe identifier for the application)
- company: text (company name)
- role: text (job title/position)
- cv_url: text (Vercel Blob URL for the PDF)
- video_url: text (YouTube unlisted video embed URL)
- description: text (legacy; no longer editable by candidates; column retained for backward compatibility)
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- view_count: integer (default 0, tracks page views)
- user_id: uuid (foreign key to auth.users)
- is_active: boolean (default true; when false, application is "archived"—link still works but shows a warning to recruiters)
```

**Requirements:**
- Enable Row Level Security (RLS)
- Create policies so users can only access their own applications
- Add indexes on slug and user_id for performance
- Generate SQL migration file that I can run in Supabase

### 2. Authentication Setup (Supabase)
- Configure Supabase Auth for email/password authentication
- Create protected admin routes that require authentication
- Set up proxy to protect /admin routes
- Provide clear instructions on what I need to configure in Supabase dashboard

### 3. Application Structure

Create the following route structure:

```
/app
  ├── page.tsx                          # Landing page (public)
  ├── view/[slug]/page.tsx              # Dynamic application page (public)
  ├── admin/
  │   ├── layout.tsx                    # Admin layout with auth check
  │   ├── page.tsx                      # Admin dashboard (list applications)
  │   ├── new/page.tsx                  # Create new application
  │   └── edit/[id]/page.tsx            # Edit existing application
  ├── login/page.tsx                    # Login page
  ├── api/
  │   ├── applications/route.ts         # CRUD operations
  │   └── upload/route.ts               # File upload to Vercel Blob
  └── layout.tsx                        # Root layout
```

### 4. Key Components Needed

#### Public Application Page (`/view/[slug]`)
- Clean, professional design with company and role prominently displayed
- If the application is archived (`is_active` false), show a warning message only; do not display the CV or video pitch
- Embedded PDF viewer for CV (with download option)
- YouTube video embed (responsive, 16:9 aspect ratio)
- Mobile-responsive layout
- Track view count when page is loaded
- 404 page if slug doesn't exist

#### Admin Dashboard (`/admin`)
- Table/grid view of all applications
- Show: company, role, slug, created date, view count; "Archived" badge when `is_active` is false
- Actions: Edit, Archive / Restore, Copy link, Delete (permanent)
- "Create New Application" button
- Search/filter functionality

#### Create/Edit Application Form
- Form fields:
  - Company name (text input)
  - Role/position (text input)
  - Slug (auto-generate from company-role, allow manual override, validate uniqueness)
  - CV upload (PDF only, max 10MB, upload to Vercel Blob)
  - YouTube video URL (text input, validate YouTube URL format)
  - Description (textarea, optional)
- Form validation
- Success/error messages
- Loading states during upload
- Preview the generated URL

#### PDF Viewer Component
- Use `react-pdf` or similar library
- Show first page preview with "View Full CV" button
- Option to download PDF
- Fallback for mobile devices

#### Video Player Component
- YouTube embed with responsive container
- Extract video ID from YouTube URL
- Handle different YouTube URL formats (watch?v=, youtu.be/, embed/, shorts/)

### 5. File Upload Flow (Vercel Blob)

Implement the following workflow:
1. User selects PDF file in admin form
2. Client-side validation (file type, size)
3. Upload to Vercel Blob via API route
4. Store returned Blob URL in Supabase
5. Display upload progress
6. Handle upload errors gracefully

Provide clear instructions on:
- How to set up Vercel Blob storage
- Required environment variables
- Token generation steps

### 6. Environment Variables

Create `.env.local` file structure with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_SITE_URL=
```

Provide clear instructions on where to find each value.

### 7. User Workflows

**Job Seeker Workflow:**
1. Log in to admin panel
2. Click "Create New Application"
3. Fill in company and role details
4. Upload tailored CV (PDF)
5. Paste YouTube unlisted video URL
6. Auto-generate or customize slug
7. Save and get shareable link
8. Copy link to send to recruiter

**Recruiter Workflow (no login required):**
1. Click unique link from candidate
2. View professional landing page
3. See company and role context
4. Read/download CV
5. Watch personalized video pitch
6. (Optional) Contact information displayed

### 8. Design Requirements

**Style Guidelines:**
- Professional, clean, modern design
- Use Tailwind CSS for all styling
- Color scheme: Professional blues/grays (provide suggestions)
- Typography: Clear hierarchy, readable fonts
- Spacing: Generous whitespace, not cramped
- Buttons: Clear CTAs with hover states
- Forms: Clean inputs with proper labels and validation states

**Responsive Design:**
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- PDF viewer adapts on mobile
- Video maintains aspect ratio
- Admin panel usable on tablet

### 9. Additional Features

**Slug Generation:**
- Auto-generate from company and role (e.g., "google-product-manager")
- Convert to lowercase, replace spaces with hyphens
- Remove special characters
- Check for uniqueness, append number if needed

**View Tracking:**
- Increment view_count when application page loads
- Prevent duplicate counts from same session (use localStorage)
- Display view count in admin dashboard

**Error Handling:**
- Graceful error messages for users
- Console logging for debugging
- Fallback UI for failed loads
- Network error handling

**Loading States:**
- Skeleton loaders for data fetching
- Upload progress indicators
- Button loading states during actions
- Page transition indicators

### 10. Step-by-Step Implementation Guide

Please help me build this in the following order:

**Phase 1: Supabase Setup**
1. Provide SQL migration for database schema
2. Guide me through enabling RLS and creating policies
3. Set up Supabase Auth configuration
4. Test database connection in Next.js

**Phase 2: Authentication**
1. Create login page
2. Set up Supabase Auth client
3. Implement proxy for protected routes
4. Create auth context/hooks

**Phase 3: Admin Dashboard**
1. Create admin layout with navigation
2. Build dashboard page with applications list
3. Implement CRUD API routes
4. Add delete functionality

**Phase 4: Application Form**
1. Create form component
2. Implement file upload to Vercel Blob
3. Add form validation
4. Handle create/update operations
5. Test slug generation

**Phase 5: Public Application Page**
1. Create dynamic route with slug parameter
2. Fetch application data from Supabase
3. Build PDF viewer component
4. Build YouTube embed component
5. Add view tracking
6. Style the page professionally

**Phase 6: Polish**
1. Add loading states everywhere
2. Implement error handling
3. Responsive design refinements
4. Add success/error toasts
5. Final testing

### 11. Testing Checklist

After building, help me test:
- [ ] User can register and login
- [ ] User can create new application
- [ ] PDF uploads successfully to Vercel Blob
- [ ] YouTube URL validation works
- [ ] Slug generation is unique
- [ ] Public page displays correctly
- [ ] PDF viewer works on desktop and mobile
- [ ] Video embeds properly
- [ ] View count increments
- [ ] User can edit applications
- [ ] User can delete applications
- [ ] RLS prevents unauthorized access
- [ ] Mobile responsive on all pages
- [ ] Error states display properly

### 12. Deployment Guide

Provide step-by-step instructions for:
1. Connecting Next.js project to Vercel
2. Setting environment variables in Vercel
3. Configuring Vercel Blob storage
4. Setting up custom domain (optional)
5. Testing production deployment

### 13. Code Quality Requirements

- Use TypeScript with proper types
- Add comments for complex logic
- Follow Next.js 16 best practices
- Use Server Components where appropriate
- Implement proper error boundaries
- Add loading.tsx files for routes
- Use proper naming conventions
- Keep components modular and reusable

### 14. Security Considerations

- Validate all user inputs
- Sanitize file uploads
- Use Supabase RLS properly
- Don't expose service role key on client
- Validate YouTube URLs to prevent XSS
- Rate limiting is implemented for API routes (see `lib/rate-limit.ts`; IP-based, in-memory; consider Upstash Redis for strict cross-instance limits in production)
- Use HTTPS for production

## Expected Output from You (Cursor)

For each phase, please:
1. Show me exactly what files to create/modify
2. Provide complete code for each file
3. Explain what the code does
4. Tell me what to configure in external services (Supabase, Vercel)
5. Provide commands to run
6. Highlight any potential issues
7. Give me testing steps

## Additional Notes

- Ask me questions if anything is unclear
- Suggest improvements if you see better approaches
- Warn me about potential issues before they happen
- Help me understand the code you're writing
- Provide fallback options if something doesn't work

Let's start with Phase 1: Supabase Setup. Please guide me through creating the database schema and setting up authentication.
