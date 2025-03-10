#!/bin/bash
# Script to reorganize the specifications directory structure

# Move product-requirements.md to core/requirements.md if not already done
if [ -f "product-requirements.md" ] && [ -f "core/requirements.md" ]; then
  echo "Removing redundant product-requirements.md"
  rm product-requirements.md
elif [ -f "product-requirements.md" ] && [ ! -f "core/requirements.md" ]; then
  echo "Moving product-requirements.md to core/requirements.md"
  mv product-requirements.md core/requirements.md
fi

# Ensure all necessary directories exist
echo "Ensuring all necessary directories exist"
mkdir -p core
mkdir -p ui
mkdir -p api
mkdir -p implementation
mkdir -p implementation/data-sync
mkdir -p implementation/auth
mkdir -p implementation/spaced-repetition
mkdir -p implementation/flag-library
mkdir -p implementation/learning-mode
mkdir -p implementation/continent-learning
mkdir -p plan
mkdir -p techstack

# Create README files for any directories missing them
for dir in ui api core; do
  if [ ! -f "$dir/README.md" ]; then
    echo "Creating README.md for $dir directory"
    echo "# $dir Specifications\n\nThis directory contains specifications for the $dir aspects of the Flag Trainer application." > "$dir/README.md"
  fi
done

# Move UPDATES-SUMMARY.md to a more appropriate location
if [ -f "UPDATES-SUMMARY.md" ]; then
  echo "Moving UPDATES-SUMMARY.md to core/changes.md"
  mv UPDATES-SUMMARY.md core/changes.md
fi

# Create feature implementation directories as needed
for feature in spaced-repetition flag-library learning-mode continent-learning auth; do
  if [ ! -d "implementation/$feature" ]; then
    echo "Creating implementation directory for $feature"
    mkdir -p "implementation/$feature"
    
    # Create basic README for each feature implementation
    echo "# Feature: ${feature//-/ }\n\n## Status\n- [ ] Planning\n- [ ] Design\n- [ ] Implementation\n- [ ] Testing\n- [ ] Deployment\n- [ ] Maintenance" > "implementation/$feature/README.md"
  fi
done

echo "Reorganization complete!" 
