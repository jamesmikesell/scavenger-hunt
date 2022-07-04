
git checkout -d
git cherry-pick deployment
npm run build
git add .
git commit --amend --no-edit 
git branch -f deployment
git checkout deployment
git push --force
git checkout main

