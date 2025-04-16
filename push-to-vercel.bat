@echo off
echo Pushing to Vercel...
git add .
git commit -m "trigger Vercel redeploy"
git push
echo Done! Check your Vercel dashboard for deployment status.
pause 