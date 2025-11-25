# 📤 How to Upload Logo and Service Images

## Quick Steps to Upload Images

### Step 1: Upload Logo to Supabase Storage

1. **Go to Supabase Storage:**
   - Open: https://supabase.com/dashboard/project/niivkjrhszjuyboqrirj/storage/buckets

2. **Create or Use Storage Bucket:**
   - Look for a bucket named `company-logos` or `employee-photos`
   - If it doesn't exist, click "New bucket"
   - Name it: `company-assets`
   - Make it **Public** (toggle the public switch)
   - Click "Create bucket"

3. **Upload Your Logo:**
   - Click on the `company-assets` bucket
   - Click "Upload file" button
   - Select your logo file from your computer
   - Click "Upload"

4. **Copy the Public URL:**
   - After upload, click on the uploaded file
   - Click "Get URL" or "Copy URL"
   - Copy the full URL (should look like: `https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-assets/logo.png`)

5. **Set Logo in Company Settings:**
   - Go to: http://localhost:3001/dashboard/company/settings
   - Paste the URL in "Company Logo URL"
   - Click "Save Changes"
   - ✅ All employee cards will now show the logo!

---

### Step 2: Upload Service Images (Optional)

If you want to use custom images instead of emoji icons:

1. **Upload Service Images:**
   - Go to the same `company-assets` bucket
   - Upload your service images (e.g., `cargo-handling.png`, `passenger-transport.png`)
   - Copy the URLs for each image

2. **Update Services in Database:**
   - Use the script provided below, or
   - Manually update via Supabase Dashboard

---

## 🖼️ Image Requirements

### Logo:
- **Format:** PNG, WEBP, JPG, or SVG
- **Size:** Recommended 200x100px to 400x200px
- **Aspect Ratio:** Wide rectangle (2:1 or similar)
- **File Size:** Less than 1MB

### Service Images:
- **Format:** PNG, WEBP, JPG
- **Size:** Square 100x100px to 300x300px
- **File Size:** Less than 500KB each

---

## 🔧 Alternative: Direct Upload Script

If you prefer to upload via command line, I can create a script that:
1. Takes your local image files
2. Uploads them to Supabase Storage
3. Updates the database automatically

Let me know if you want this option!

---

## 📝 Quick Checklist

- [ ] Create `company-assets` bucket in Supabase (if not exists)
- [ ] Make bucket **Public**
- [ ] Upload logo file
- [ ] Copy logo public URL
- [ ] Paste URL in Company Settings → Save
- [ ] Refresh employee card to see logo
- [ ] (Optional) Upload service images
- [ ] (Optional) Update services with image URLs

---

## ✅ Verify It Works

After uploading and saving:

1. Go to any employee card
2. You should see your logo in the header
3. If you added service images, they'll show in the Services section

---

## 🆘 Troubleshooting

**Issue:** "Image doesn't show on card"
**Solution:**
- Check bucket is **Public**
- Verify URL is correct in Company Settings
- Refresh the card page

**Issue:** "Bucket not found"
**Solution:**
- Create a new bucket named `company-assets`
- Make sure to toggle **Public** when creating

**Issue:** "Upload failed"
**Solution:**
- Check file size (must be < 5MB)
- Check file format (PNG, JPG, WEBP, SVG)
- Try a different browser

---

## 🎯 Next Step

**Go here now:** https://supabase.com/dashboard/project/niivkjrhszjuyboqrirj/storage/buckets

Then follow Step 1 above! 🚀
