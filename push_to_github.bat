@echo off
echo ========================================================
echo Pushing Woozworld Online to GitHub Repository:
echo https://github.com/liorman050985-dotcom/woozworld
echo ========================================================
git branch -M main
git push -u origin main --force
echo.
echo ========================================================
echo PUSH COMPLETE!
echo Go to: https://github.com/liorman050985-dotcom/woozworld/settings/pages
echo Set Source to "GitHub Actions" to view your live game!
echo ========================================================
pause
