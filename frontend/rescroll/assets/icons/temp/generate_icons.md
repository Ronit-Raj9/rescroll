# Step-by-Step Guide for Generating and Implementing AI Icons

## Step 1: Generate AI Icons
Use an AI image generation tool like DALL-E, Midjourney, or similar to create the icons based on the descriptions in `icon_guide.md`.

### Prompt Templates for AI Image Generation
Use these prompts as starting points:

#### Search Icon
```
A minimalist, clean, modern icon of a magnifying glass with an academic paper visible inside. Simple lines, professional design, suitable as an app icon. Transparent background. Digital art style.
```

#### Top Papers Icon
```
A minimalist, clean icon of a stack of academic papers with the top paper having a star or trophy symbol. Simple lines, professional design, suitable as an app icon. Transparent background. Digital art style.
```

#### Bookmarks Icon
```
A minimalist, clean icon of a modern bookmark with visible pages or an open book. Simple lines, professional design, suitable as an app icon. Transparent background. Digital art style.
```

#### Explore Icon
```
A minimalist, clean icon of a compass or globe with subtle academic/research elements. Simple lines, professional design, suitable as an app icon. Transparent background. Digital art style.
```

## Step 2: Process the Icons
1. After generating, download the icons
2. Edit if necessary to ensure:
   - Clean, transparent background
   - Correct dimensions (can be larger initially but should be exported at 24x24px or 26x26px)
   - Consistent style across all icons
   - Simple enough to be recognizable at small sizes
   - Works in both light and dark modes (will be tinted)

## Step 3: Save Icons to the Correct Location
Save the processed icons as:
- `frontend/rescroll/assets/icons/ai-search.png`
- `frontend/rescroll/assets/icons/ai-top-papers.png`
- `frontend/rescroll/assets/icons/ai-bookmarks.png`
- `frontend/rescroll/assets/icons/ai-explore.png`

## Step 4: Verify Implementation
1. The app code in `frontend/rescroll/app/(tabs)/_layout.tsx` is already set up to use these icon paths
2. Run the app to verify the icons appear correctly in the bottom tab bar
3. Check that they look good in both light and dark mode
4. Ensure they're properly sized and positioned

## Step 5: Commit Changes
Once the icons look good, commit the changes to your repository:
```bash
git add frontend/rescroll/assets/icons/*.png
git commit -m "Add AI-generated icons for tab navigation"
git push
``` 