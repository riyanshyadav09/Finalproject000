# StreamFlix - Ready-to-Use AI Prompts

## 🤖 Prompts for Development & Setup

### 1. Create Complete Folder Structure

```
Create the following folder structure exactly (lowercase, hyphen-separated):

/streamflix/
  /docs/
    /product-brief/
    /implementation/
    /onboarding/
    /moderation-guides/
  /marketing/
    /hero-banners/
    /copy-lines/
  /app/
    /(auth)/
      /login/
      /register/
      /verify/
    /movies/
    /tv-shows/
    /categories/
    /browse/
    /my-list/
    /watch/[id]/
    /creator/[id]/
    /admin/
      /dashboard/
      /users/
      /videos/
      /analytics/
      /payouts/
    /api/
      /auth/
      /videos/
      /users/
      /upload/
      /stream/
  /components/
    /ui/
    /video/
    /layout/
    /auth/
  /lib/
    /auth/
    /db/
    /utils/
    /video/
  /content/
    /manifests/
    /trending/
      /weekly/
        /trailers/
        /music/
        /comedy/
        /creator-reels/
      /monthly/
        /trailers/
        /music/
        /comedy/
        /creator-reels/
    /originals/
    /embeds/
  /creators/
    /profiles-csv/
    /promo-assets/
  /payments/
    /payouts/
      /manual/
      /auto/
    /kyc-data/
  /analytics/
    /events/
  /legal/
    /takedown-templates/
    /tos-privacy/
  /prisma/
  /k8s/
  /public/
    /images/
    /videos/

Also create an example manifest CSV file at /content/manifests/example-manifest.csv with columns:
video_id,filename,category,sub_category,upload_date,source_type,creator_id,title,tags,is_monetizable,visibility,notes
```

---

### 2. Generate Sample Video Data (100 rows)

```
Generate 100 CSV rows for /content/manifests/all-videos.csv with the following structure:

Columns: video_id,filename,category,sub_category,upload_date,source_type,creator_id,title,tags,is_monetizable,visibility,notes

Requirements:
- video_id: vid001 to vid100
- filename: YYYYMMDD_category_creatorID_title_v1.mp4
- category: trailers, music, comedy, creator-reels (distribute evenly)
- sub_category: relevant subcategories (bollywood, standup, cover, vlog, etc.)
- upload_date: dates from 2024-11-01 to 2024-12-02 (recent dates)
- source_type: uploaded, youtube, instagram (70% uploaded, 20% youtube, 10% instagram)
- creator_id: creator001 to creator050 (random distribution)
- title: realistic video titles (max 50 chars)
- tags: 3-5 relevant tags (comma-separated)
- is_monetizable: yes/no (80% yes, 20% no)
- visibility: published, pending, rejected (90% published, 8% pending, 2% rejected)
- notes: brief admin notes or empty

Format as proper CSV with headers.
```

---

### 3. Generate Trending Top 10 Lists

```
Generate 4 separate CSV files for weekly trending content:

File 1: /content/trending/weekly/trailers/top10.csv
File 2: /content/trending/weekly/music/top10.csv
File 3: /content/trending/weekly/comedy/top10.csv
File 4: /content/trending/weekly/creator-reels/top10.csv

Columns for each: video_id,filename,category,upload_date,source_type,creator_id,title,views_48h,watch_time_avg,share_count,score

Requirements:
- 10 rows per file
- views_48h: 50,000 to 300,000 (descending order)
- watch_time_avg: 120 to 240 seconds
- share_count: 1,000 to 6,000
- score: 0.60 to 0.95 (calculated using formula: 0.5*norm(views) + 0.25*norm(watch_time) + 0.15*norm(shares) + 0.10*engagement)
- Realistic titles for each category
- Recent upload dates (last 7 days)
```

---

### 4. Create Creator Profiles CSV

```
Generate a creator profiles CSV at /creators/profiles-csv/creators.csv with 50 rows.

Columns: creator_id,username,display_name,email,phone,bio,social_instagram,social_youtube,social_twitter,total_videos,total_views,total_earnings,kyc_verified,joined_date,status

Requirements:
- creator_id: creator001 to creator050
- username: lowercase, no spaces (e.g., achal_comedy, priya_music)
- display_name: proper names (e.g., Achal Sharma, Priya Singh)
- email: realistic emails
- phone: Indian format (+91-XXXXXXXXXX)
- bio: 50-100 char creator bio
- social links: realistic handles (some empty)
- total_videos: 5 to 100
- total_views: 10,000 to 5,000,000
- total_earnings: ₹5,000 to ₹500,000
- kyc_verified: true/false (70% true)
- joined_date: dates from 2024-01-01 to 2024-11-30
- status: active, suspended, pending (95% active)
```

---

### 5. Generate Payout Requests CSV

```
Create a payout requests CSV at /payments/payouts/manual/payout-requests.csv with 20 rows.

Columns: request_id,creator_id,amount,bank_account_no,ifsc,upi_id,pan,requested_on,processed_on,status,notes

Requirements:
- request_id: PR001 to PR020
- creator_id: random from creator001-creator050
- amount: ₹500 to ₹50,000
- bank_account_no: realistic 11-16 digit numbers
- ifsc: realistic IFSC codes (e.g., SBIN0001234)
- upi_id: realistic UPI IDs (e.g., username@paytm)
- pan: realistic PAN format (e.g., ABCDE1234F)
- requested_on: dates from 2024-11-01 to 2024-12-02
- processed_on: empty for pending, date for completed
- status: pending, processing, completed, rejected (50% completed, 30% pending, 15% processing, 5% rejected)
- notes: brief notes or empty
```

---

### 6. Create Analytics Events Sample

```
Generate analytics events JSON file at /analytics/events/sample-events.json with 100 events.

Event structure:
{
  "event_id": "evt_xxxxx",
  "event_type": "view|like|share|comment|download",
  "video_id": "vidXXX",
  "user_id": "userXXX",
  "creator_id": "creatorXXX",
  "timestamp": "ISO 8601 format",
  "metadata": {
    "watch_duration": seconds,
    "quality": "360p|720p|1080p|4K",
    "device": "mobile|desktop|tablet",
    "location": "city, country"
  }
}

Requirements:
- 100 events
- event_type distribution: 60% view, 20% like, 10% share, 8% comment, 2% download
- Recent timestamps (last 7 days)
- Realistic metadata
- Format as JSON array
```

---

### 7. Generate Legal Templates

```
Create 3 legal document templates:

File 1: /legal/takedown-templates/dmca-notice.md
- Standard DMCA takedown notice template
- Include placeholders for: copyright owner, infringing content URL, contact info
- Professional legal language

File 2: /legal/tos-privacy/terms-of-service.md
- Terms of Service for StreamFlix
- Sections: User Agreement, Content Policy, Creator Terms, Payment Terms, Liability
- India-specific legal requirements

File 3: /legal/tos-privacy/privacy-policy.md
- Privacy Policy for StreamFlix
- Sections: Data Collection, Usage, Storage, Sharing, User Rights, GDPR Compliance
- India-specific data protection laws
```

---

### 8. Create Onboarding Documentation

```
Generate user onboarding guides:

File 1: /docs/onboarding/user-guide.md
- How to sign up
- How to browse content
- How to create watchlist
- How to upgrade to premium
- FAQ section

File 2: /docs/onboarding/creator-guide.md
- How to become a creator
- How to upload videos
- How to verify rights
- How to track earnings
- How to request payouts
- Best practices

File 3: /docs/onboarding/admin-guide.md
- Admin dashboard overview
- Content moderation workflow
- User management
- Payout processing
- Analytics interpretation
```

---

### 9. Generate Marketing Assets List

```
Create a marketing assets inventory at /marketing/assets-inventory.csv

Columns: asset_id,asset_type,filename,dimensions,format,usage,created_date,status

Asset types to include:
- Hero banners (1920x1080)
- Social media posts (1080x1080, 1080x1920)
- Email headers (600x200)
- App store screenshots (various sizes)
- Promotional videos (1920x1080)
- Logo variations (SVG, PNG)

Generate 30 rows with realistic data.
```

---

### 10. Create Database Seed Script

```
Generate a Prisma seed script at /prisma/seed.ts that:

1. Creates 50 users (10 admins, 15 creators, 25 regular users)
2. Creates 100 videos with proper relationships
3. Creates subscriptions for premium users
4. Creates watch history for users
5. Creates comments and ratings
6. Creates playlists
7. Creates analytics records

Use realistic data and proper Prisma syntax.
Include error handling and transaction management.
```

---

## 🎨 Design & UI Prompts

### 11. Generate Color Palette

```
Create a comprehensive color palette for StreamFlix with:

Primary Colors:
- Netflix Red (#E50914) - main brand color
- Black (#141414) - background
- White (#FFFFFF) - text

Secondary Colors:
- Gray shades (5 variations from #1a1a1a to #f5f5f5)
- Accent colors for categories (trailers, music, comedy, reels)

Semantic Colors:
- Success (green)
- Warning (yellow)
- Error (red)
- Info (blue)

Export as:
1. CSS variables
2. Tailwind config
3. Figma color styles
```

---

### 12. Create Component Library

```
Generate a component library documentation at /docs/components/README.md listing:

1. Button variants (primary, secondary, outline, ghost, netflix)
2. Input types (text, email, password, search)
3. Card layouts (video card, creator card, stats card)
4. Navigation components (navbar, sidebar, breadcrumbs)
5. Modal types (video player, confirmation, form)
6. Loading states (skeleton, spinner, progress bar)
7. Toast notifications
8. Dropdown menus

For each component, include:
- Usage example
- Props/API
- Variants
- Accessibility notes
```

---

## 📊 Analytics & Reporting Prompts

### 13. Generate Analytics Dashboard Config

```
Create a dashboard configuration JSON at /analytics/dashboard-config.json with:

Widgets:
1. Total Users (KPI card)
2. Active Creators (KPI card)
3. Total Videos (KPI card)
4. Revenue (KPI card)
5. Views Over Time (line chart)
6. Top Videos (table)
7. Top Creators (table)
8. Category Distribution (pie chart)
9. User Growth (area chart)
10. Engagement Metrics (bar chart)

For each widget, specify:
- Widget type
- Data source
- Refresh interval
- Filters available
- Export options
```

---

### 14. Create Report Templates

```
Generate monthly report templates:

File 1: /analytics/reports/monthly-platform-report.md
- Executive summary
- User metrics
- Content metrics
- Revenue metrics
- Creator metrics
- Top performers
- Issues & resolutions

File 2: /analytics/reports/creator-earnings-report.md
- Creator-specific earnings
- Video performance
- Audience insights
- Payout history
- Growth recommendations
```

---

## 🔧 DevOps & Deployment Prompts

### 15. Generate CI/CD Pipeline

```
Create a complete CI/CD pipeline configuration for:

1. GitHub Actions workflow (.github/workflows/deploy.yml)
   - Build and test
   - Docker image creation
   - Push to registry
   - Deploy to Kubernetes

2. Docker Compose for local development
   - Next.js app
   - PostgreSQL
   - Redis
   - NGINX

3. Kubernetes manifests
   - Deployment
   - Service
   - Ingress
   - ConfigMap
   - Secrets
   - HPA

Include environment-specific configs (dev, staging, production).
```

---

*Last Updated: December 2024*
*Use these prompts with AI assistants or development tools to quickly generate required files and data.*