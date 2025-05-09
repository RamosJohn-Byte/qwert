# Deploying the Online Quiz System to Vercel

This guide will walk you through deploying the Online Quiz System to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A Supabase account with a project set up (sign up at [supabase.com](https://supabase.com))
3. Git installed on your local machine

## Step 1: Prepare Your Project

1. Make sure all your files are organized as shown in the repository structure.
2. Ensure you have the `vercel.json` file in the root of your project.

## Step 2: Set Up Environment Variables

1. Get your Supabase URL and anon key from your Supabase project dashboard.
2. You'll need these values for the Vercel deployment.

## Step 3: Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. Install the Vercel CLI:
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. Log in to Vercel:
   \`\`\`bash
   vercel login
   \`\`\`

3. Deploy your project:
   \`\`\`bash
   vercel
   \`\`\`

4. Follow the prompts and set your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### Option 2: Deploy via Vercel Dashboard

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click "New Project" and import your repository.
4. Configure the project:
   - Set the framework preset to "Other"
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Click "Deploy"

## Step 4: Verify Deployment

1. Once deployed, Vercel will provide you with a URL for your application.
2. Visit the URL to ensure everything is working correctly.
3. Test the authentication, quiz creation, and quiz-taking functionality.

## Step 5: Set Up a Custom Domain (Optional)

1. In the Vercel dashboard, go to your project settings.
2. Click on "Domains" and add your custom domain.
3. Follow the instructions to configure DNS settings.

## Troubleshooting

If you encounter issues with the deployment:

1. Check the Vercel deployment logs for errors.
2. Ensure your environment variables are set correctly.
3. Verify that your Supabase project is set up properly with the correct tables and policies.
4. Check the browser console for any JavaScript errors.

## Updating Your Deployment

To update your deployment after making changes:

1. Push your changes to your repository (if using Git).
2. Vercel will automatically redeploy your application.
3. Alternatively, run `vercel` again if using the CLI.
