@echo off
echo Pushing to Vercel...
git add .
git commit -m "force clean deploy on Vercel"
git push
echo Done! Check your Vercel dashboard for deployment status.
pause 