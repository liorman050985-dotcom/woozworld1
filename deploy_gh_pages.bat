@echo off
echo ========================================================
echo Building and Deploying to gh-pages branch...
echo ========================================================
call npm.cmd run build
git add -A
git commit -m "Update build"
git subtree push --prefix dist origin gh-pages
echo.
echo ========================================================
echo DEPLOYMENT COMPLETE!
echo ========================================================
pause
