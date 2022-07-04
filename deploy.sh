#!/bin/sh

if [ -z "$(git status --porcelain)" ]; then
  old_branch=$(git branch --show-current)
  git branch -f deployment
  git checkout deployment

  rm -rf docs
  rm -rf dist
  echo "export class AppVersion { static readonly VERSION = \""$(git rev-parse --short HEAD)"\"; }">src/app/app-version.ts
  npm run build
  mv dist/scavenger-hunt docs


  git add -A
  git commit -m "build(deploy): deploying "$(git rev-parse --short HEAD)
  git push --force
  git checkout $old_branch
else 
  echo "Error: commit all changes before attempting deploying"
  exit 1
fi
