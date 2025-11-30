# Custom Email Templates for DiffSlides

This directory contains custom email templates for user registration and authentication emails. These templates match the DiffSlides branding and theme.

## Templates

- **confirmation.html** - HTML email template for email confirmation
- **confirmation.txt** - Plain text fallback for email confirmation

## Setup Instructions

To use these custom email templates with Supabase, you need to configure them in your Supabase project dashboard:

### Step 1: Access Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Confirmation Email

1. Click on the **Confirmation** template
2. Copy the contents of `emails/confirmation.html` and paste it into the HTML editor
3. Copy the contents of `emails/confirmation.txt` and paste it into the Plain text editor
4. Click **Save**

### Step 3: Configure Email Settings

1. Go to **Authentication** → **URL Configuration**
2. Set the **Site URL** to your production domain (e.g., `https://yourdomain.com`)
3. Add your production domain to **Redirect URLs**:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)

### Step 4: Environment Variables

Make sure you have the following environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # or http://localhost:3000 for local dev
```

### Step 5: Enable Email Confirmation (Optional)

If you want to require email confirmation before users can sign in:

1. Go to **Authentication** → **Providers** → **Email**
2. Enable **Confirm email** toggle
3. Configure email confirmation settings as needed

## Template Variables

The templates use Supabase's built-in template variables:

- `{{ .ConfirmationURL }}` - The confirmation link URL
- `{{ .Email }}` - The user's email address
- `{{ .Year }}` - Current year

## Testing

### Preview in Browser

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/preview-email`
3. This will show you exactly how the email will look with sample data

### Test with Supabase

1. **Configure the template in Supabase Dashboard:**

   - Go to **Authentication** → **Email Templates**
   - Copy the contents of `emails/confirmation.html` into the Confirmation HTML template
   - Copy the contents of `emails/confirmation.txt` into the Confirmation Plain text template
   - Click **Save**

2. **Test with a real registration:**

   - Register a new account with a real email address
   - Check your inbox (and spam folder) for the confirmation email
   - Click the confirmation link to verify it works

3. **Use Supabase's email testing feature:**
   - In the Supabase Dashboard, you can send test emails to verify the template
   - Make sure to test both HTML and plain text versions

## Customization

The templates are designed to match DiffSlides branding:

- Dark theme background (#1a1a1a)
- Green accent color (#22c55e) for links
- Monospace font for branding
- Developer-focused aesthetic

You can customize colors, fonts, and layout by editing the HTML template. Make sure to:

- Use inline CSS (email clients don't support external stylesheets)
- Test in multiple email clients
- Keep the template variables intact
