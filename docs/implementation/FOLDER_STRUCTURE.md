# StreamFlix - Folder & Page Structure

## 📁 Complete Folder Structure

```
/streamflix-demo/
│
├─ /docs/                          # Documentation
│   ├─ /product-brief/             # Product briefs & pitch decks
│   ├─ /implementation/            # Technical implementation guides
│   ├─ /onboarding/                # User & creator onboarding docs
│   └─ /moderation-guides/         # Content moderation guidelines
│
├─ /marketing/                     # Marketing assets
│   ├─ /hero-banners/              # Landing page banners
│   └─ /copy-lines/                # Marketing copy & CTAs
│
├─ /app/                           # Next.js 14 App Router
│   ├─ /(auth)/                    # Authentication pages
│   │   ├─ /login/
│   │   ├─ /register/
│   │   └─ /verify/
│   ├─ /movies/                    # Movies listing page
│   ├─ /tv-shows/                  # TV shows listing page
│   ├─ /categories/                # Category browsing
│   ├─ /browse/                    # Browse all content
│   ├─ /my-list/                   # User's watchlist
│   ├─ /watch/[id]/                # Video player page
│   ├─ /creator/[id]/              # Creator profile page
│   ├─ /admin/                     # Admin dashboard
│   │   ├─ /dashboard/
│   │   ├─ /users/
│   │   ├─ /videos/
│   │   ├─ /analytics/
│   │   └─ /payouts/
│   ├─ /api/                       # API routes
│   │   ├─ /auth/
│   │   ├─ /videos/
│   │   ├─ /users/
│   │   ├─ /upload/
│   │   └─ /stream/
│   ├─ globals.css
│   ├─ layout.tsx
│   └─ page.tsx
│
├─ /components/                    # React components
│   ├─ /ui/                        # shadcn/ui components
│   ├─ /video/                     # Video-related components
│   ├─ /layout/                    # Layout components
│   └─ /auth/                      # Auth components
│
├─ /lib/                           # Utility libraries
│   ├─ /auth/                      # Authentication utilities
│   ├─ /db/                        # Database utilities
│   ├─ /utils/                     # General utilities
│   └─ /video/                     # Video processing utilities
│
├─ /content/                       # Content management
│   ├─ /manifests/                 # CSV/JSON manifests
│   ├─ /trending/                  # Trending content
│   │   ├─ /weekly/
│   │   │   ├─ /trailers/
│   │   │   ├─ /music/
│   │   │   ├─ /comedy/
│   │   │   └─ /creator-reels/
│   │   └─ /monthly/
│   │       ├─ /trailers/
│   │       ├─ /music/
│   │       ├─ /comedy/
│   │       └─ /creator-reels/
│   ├─ /originals/                 # Original uploads
│   └─ /embeds/                    # Embed metadata
│
├─ /creators/                      # Creator management
│   ├─ /profiles-csv/              # Creator profiles
│   └─ /promo-assets/              # Promotional materials
│
├─ /payments/                      # Payment processing
│   ├─ /payouts/
│   │   ├─ /manual/                # Manual payouts
│   │   └─ /auto/                  # Automated payouts
│   └─ /kyc-data/                  # KYC documents
│
├─ /analytics/                     # Analytics data
│   └─ /events/                    # Event tracking
│
├─ /legal/                         # Legal documents
│   ├─ /takedown-templates/        # DMCA templates
│   └─ /tos-privacy/               # Terms & Privacy
│
├─ /prisma/                        # Database schema
│   └─ schema.prisma
│
├─ /k8s/                           # Kubernetes configs
│   ├─ namespace.yaml
│   ├─ deployment.yaml
│   ├─ service.yaml
│   └─ ingress.yaml
│
├─ /public/                        # Static assets
│   ├─ /images/
│   └─ /videos/
│
├─ Dockerfile
├─ docker-compose.yml
├─ next.config.js
├─ tailwind.config.js
├─ tsconfig.json
└─ package.json
```

---

## 📄 File Naming Conventions

### Video Files
**Format**: `YYYYMMDD_category_creatorID_title_v1.mp4`

**Examples**:
- `20241202_comedy_achal123_funny-bite-v1.mp4`
- `20241201_music_priya456_cover-song-v1.mp4`
- `20241130_trailer_studio789_movie-teaser-v1.mp4`

### Embed Records (JSON)
**Format**: `embed_YYYYMMDD_provider_videoid_creatorID.json`

**Examples**:
- `embed_20241202_youtube_XYzAbc123_achal123.json`
- `embed_20241201_instagram_AbC123xyz_priya456.json`

### Manifest Files (CSV)
**Format**: `category_period_YYYYMMDD.csv`

**Examples**:
- `trailers_weekly_20241202.csv`
- `music_monthly_202412.csv`
- `comedy_weekly_20241202.csv`

---

## 📊 Manifest CSV Structure

### Columns
```csv
video_id,filename,category,sub_category,upload_date,source_type,creator_id,title,tags,is_monetizable,visibility,notes
```

### Sample Row
```csv
vid001,20241202_comedy_achal123_funny-bite-v1.mp4,comedy,standup,2024-12-02,uploaded,achal123,"Funny Bite","comedy,short,viral",yes,published,"approved by ops"
```

### Field Descriptions
- **video_id**: Unique identifier (vid001, vid002, etc.)
- **filename**: Physical file name
- **category**: Main category (trailers, music, comedy, creator-reels)
- **sub_category**: Subcategory (standup, cover, action, etc.)
- **upload_date**: YYYY-MM-DD format
- **source_type**: uploaded | youtube | instagram | vimeo
- **creator_id**: Creator's unique ID
- **title**: Video title (max 100 chars)
- **tags**: Comma-separated tags
- **is_monetizable**: yes | no
- **visibility**: published | pending | rejected | private
- **notes**: Admin notes

---

## 🎯 Page Structure & Routes

### Public Pages
```
/                           → Home (Trending feed)
/movies                     → Movies listing
/tv-shows                   → TV shows listing
/categories                 → Browse by category
/browse                     → Browse all content
/watch/:id                  → Video player
/creator/:id                → Creator profile
/login                      → Login page
/register                   → Registration page
```

### Protected Pages (User)
```
/my-list                    → User's watchlist
/profile                    → User profile
/settings                   → User settings
/subscriptions              → Subscription management
```

### Protected Pages (Creator)
```
/creator/dashboard          → Creator dashboard
/creator/upload             → Upload content
/creator/analytics          → Content analytics
/creator/earnings           → Earnings & payouts
```

### Protected Pages (Admin)
```
/admin/dashboard            → Admin overview
/admin/users                → User management
/admin/videos               → Video moderation
/admin/analytics            → Platform analytics
/admin/payouts              → Payout processing
/admin/reports              → Content reports
```

---

## 🔄 Content Flow Sequence

### 1. Trending Feed Logic
```
Home → Weekly/Monthly Tabs → Category Sections → Top 10 Display
```

**Display Rules**:
- Show Top 10 by default
- "Watch More" button loads full list
- Pagination: 20 items per page
- Auto-refresh: Every 6 hours

### 2. Video Upload Flow
```
Creator Login → Upload Page → Choose File/Embed → Fill Metadata → 
Rights Checkbox → Submit → Pending Review → Published/Rejected
```

### 3. Payout Flow
```
Creator Earnings → Request Payout → KYC Verification → 
Admin Approval → Payment Processing → Confirmation
```

---

## 📐 Trending Score Formula

```javascript
Score = 
  0.5 * normalized(views_last_48h) + 
  0.25 * normalized(watch_time_per_view) + 
  0.15 * normalized(share_count) + 
  0.10 * normalized(engagement_rate)
```

**Freshness Filter**: Exclude content older than 30 days by default

---

## 🎨 Category Structure

### Main Categories
1. **Trailers**
   - Hollywood
   - Bollywood
   - South Cinema
   - Regional

2. **Music**
   - International Pop
   - Bollywood
   - Indie/Covers
   - Regional

3. **Comedy**
   - Standup
   - Sketches
   - Shorts

4. **Creator Reels**
   - Trending
   - New
   - Popular

### Subcategories by Language
- Hindi
- English
- Tamil
- Telugu
- Punjabi
- Marathi
- Bengali
- Kannada

---

## 💳 Payment Structure

### Minimum Payout
₹500 (adjustable)

### KYC Required Fields
```json
{
  "full_name": "string",
  "pan": "string",
  "bank_account_no": "string",
  "ifsc": "string",
  "upi_id": "string",
  "proof_id": "file",
  "address": "string",
  "kyc_verified": "boolean"
}
```

### Payout Schedule
- **Manual**: On-demand (admin approval)
- **Automated**: Weekly (Fridays)
- **Processing Time**: 3-5 business days

---

*Last Updated: December 2024*