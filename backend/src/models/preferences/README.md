# Preferences System Workflow Guide

This guide explains how to add new preference subcategories to the preferences system.

## Overview

The preferences system is organized into:
- **Main Preferences Model**: `preferences.model.js` - Ties all user preferences together
- **Subcategory Models**: Individual models for each preference type (e.g., `notificationPreferences.model.js`)
- **Controllers**: Separate controllers for each subcategory
- **Routes**: Nested routes under `/api/preferences/{subcategory}`

## Current Subcategories

✅ Completed:
1. Notifications (`notificationPreferences`)
2. VIP (`vipPreferences`)
3. Navigation (`navigationPreferences`)
4. Home (`homePreferences`)
5. Appearance (`appearancePreferences`)
6. Messages & Media (`messagesMediaPreferences`)
7. Language & Region (`languageRegionPreferences`)
8. Accessibility (`accessibilityPreferences`)
9. Mark As Read (`markAsReadPreferences`)
10. Audio & Video (`audioVideoPreferences`)

⏳ Remaining:
- Privacy & Visibility (`privacyVisibilityPreferences`)
- Slack AI (`slackAIPreferences`)
- Advanced (`advancedPreferences`)

## Step-by-Step Workflow

### 1. Check Frontend Types

First, check `frontend/src/features/preferences/types.ts` for the interface definition:

```typescript
export interface YourPreferences {
  field1: string;
  field2: boolean;
  field3: SomeEnum;
}
```

Also check `frontend/src/features/preferences/defaults.ts` for default values.

### 2. Create Model File

Create `backend/src/models/preferences/yourPreferences.model.js`:

```javascript
import mongoose from 'mongoose';

const yourPreferencesSchema = new mongoose.Schema(
  {
    field1: {
      type: String,
      default: 'defaultValue',
    },
    field2: {
      type: Boolean,
      default: true,
    },
    field3: {
      type: String,
      enum: ['value1', 'value2', 'value3'], // if applicable
      default: 'value1',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('YourPreferences', yourPreferencesSchema);
```

**Important Notes:**
- Match field names exactly with frontend interface
- Use appropriate types (String, Boolean, Number, [String] for arrays)
- Add enum validation if field uses enum values
- Set defaults matching `defaults.ts`
- Add comments for fields that reference other schemas (e.g., "Note: displayTypingIndicator is managed in AppearancePreferences")

### 3. Create Controller File

Create `backend/src/controllers/preferences/yourPreferences.controller.js`:

```javascript
import Preferences from '../../models/preferences/preferences.model.js';
import YourPreferences from '../../models/preferences/yourPreferences.model.js';

// @desc    get user's your preferences
// @route   GET /api/preferences/your-preferences
// @access  Private
export const getYourPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get your preferences
    let yourPrefs = null;
    if (userPreferences.yourPreferences) {
      yourPrefs = await YourPreferences.findById(userPreferences.yourPreferences);
    }

    // If your preferences don't exist, return defaults
    if (!yourPrefs) {
      yourPrefs = await YourPreferences.create({
        // Add all default values matching frontend defaults.ts
        field1: 'defaultValue',
        field2: true,
        field3: 'value1',
      });
      userPreferences.yourPreferences = yourPrefs._id;
      await userPreferences.save();
    }

    res.status(200).json({
      success: true,
      data: yourPrefs,
    });
  } catch (error) {
    console.log('Error in getYourPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    update user's your preferences
// @route   PATCH /api/preferences/your-preferences
// @access  Private
/*
  body {
    field1 (optional),
    field2 (optional),
    field3 (optional)
  }
*/
export const updateYourPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate enum values if applicable
    if (updateData.field3 && !['value1', 'value2', 'value3'].includes(updateData.field3)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field3. Must be one of: value1, value2, value3',
      });
    }

    // Validate array types if applicable
    if (updateData.arrayField !== undefined && !Array.isArray(updateData.arrayField)) {
      return res.status(400).json({
        success: false,
        message: 'arrayField must be an array',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Get or create your preferences
    let yourPrefs = null;
    if (userPreferences.yourPreferences) {
      yourPrefs = await YourPreferences.findById(userPreferences.yourPreferences);
    }

    if (!yourPrefs) {
      // Create with defaults and merge with update data
      yourPrefs = await YourPreferences.create({
        field1: 'defaultValue',
        field2: true,
        field3: 'value1',
        ...updateData,
      });
      userPreferences.yourPreferences = yourPrefs._id;
      await userPreferences.save();
    } else {
      // Update existing preferences (only update provided fields)
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          yourPrefs[key] = updateData[key];
        }
      });
      await yourPrefs.save();
    }

    res.status(200).json({
      success: true,
      data: yourPrefs,
    });
  } catch (error) {
    console.log('Error in updateYourPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// @desc    create your preferences for user
// @route   POST /api/preferences/your-preferences
// @access  Private
/*
  body {
    field1 (optional),
    field2 (optional),
    field3 (optional)
  }
*/
export const createYourPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { field1, field2, field3 } = req.body;

    // Validate enum values if applicable
    if (field3 && !['value1', 'value2', 'value3'].includes(field3)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field3. Must be one of: value1, value2, value3',
      });
    }

    // Get or create user preferences
    let userPreferences = await Preferences.findOne({ user: userId });
    if (!userPreferences) {
      userPreferences = await Preferences.create({ user: userId });
    }

    // Check if your preferences already exist
    if (userPreferences.yourPreferences) {
      return res.status(400).json({
        success: false,
        message: 'Your preferences already exist. Use PATCH to update.',
      });
    }

    // Create your preferences
    const yourPrefs = await YourPreferences.create({
      field1: field1 ?? 'defaultValue',
      field2: field2 ?? true,
      field3: field3 ?? 'value1',
    });

    // Link to user preferences
    userPreferences.yourPreferences = yourPrefs._id;
    await userPreferences.save();

    res.status(201).json({
      success: true,
      data: yourPrefs,
    });
  } catch (error) {
    console.log('Error in createYourPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
```

**Key Patterns:**
- Always check/create user preferences first
- Validate enum values if applicable
- Validate array types if applicable
- Create defaults when preferences don't exist
- Allow partial updates in PATCH
- Use consistent error handling

### 4. Create Route File

Create `backend/src/routes/preferences/yourPreferences.route.js`:

```javascript
import express from 'express';

import { protectRoute } from '../../middlewares/protectRoute.js';
import {
  getYourPreferences,
  updateYourPreferences,
  createYourPreferences,
} from '../../controllers/preferences/yourPreferences.controller.js';

const router = express.Router();

router.get('/', protectRoute, getYourPreferences);
router.post('/', protectRoute, createYourPreferences);
router.patch('/', protectRoute, updateYourPreferences);

export default router;
```

**Route naming convention:**
- Use kebab-case for URL paths: `/your-preferences`
- File names use camelCase: `yourPreferences.route.js`

### 5. Update Main Preferences Model

Add reference in `backend/src/models/preferences/preferences.model.js`:

```javascript
yourPreferences: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'YourPreferences',
  default: null,
},
```

The model already has all subcategories defined, but verify your subcategory name matches the frontend interface key.

### 6. Update Main Preferences Controller

In `backend/src/controllers/preferences/preferences.controller.js`:

**a) Add import at the top:**
```javascript
import YourPreferences from '../../models/preferences/yourPreferences.model.js';
```

**b) Add update handler in `updatePreferences` function:**
```javascript
// Handle your preferences update
if (updateData.yourPreferences) {
  if (preferences.yourPreferences) {
    await YourPreferences.findByIdAndUpdate(
      preferences.yourPreferences,
      updateData.yourPreferences,
      { new: true }
    );
  } else {
    const yourPrefs = await YourPreferences.create(updateData.yourPreferences);
    preferences.yourPreferences = yourPrefs._id;
    await preferences.save();
  }
}
```

**Note:** Replace `yourPreferences` with your actual subcategory name (e.g., `privacyVisibility`, `slackAI`, `advanced`).

### 7. Update Main Preferences Route

In `backend/src/routes/preferences/preferences.route.js`:

**a) Add import:**
```javascript
import yourPreferencesRoute from './yourPreferences.route.js';
```

**b) Register route:**
```javascript
router.use('/your-preferences', yourPreferencesRoute);
```

**Route naming:**
- Match the kebab-case URL path (e.g., `/privacy-visibility`, `/slack-ai`, `/advanced`)
- Use camelCase for import variable name

### 8. Verification Checklist

- [ ] Model file created with all fields matching frontend interface
- [ ] Model has correct defaults matching `defaults.ts`
- [ ] Controller has all three functions (get, update, create)
- [ ] Controller validates enum values if applicable
- [ ] Controller validates array types if applicable
- [ ] Route file created with GET, POST, PATCH endpoints
- [ ] Route uses `protectRoute` middleware
- [ ] Main preferences model has reference (if not already present)
- [ ] Main preferences controller has import and update handler
- [ ] Main preferences route has import and registration
- [ ] No linter errors
- [ ] Test the endpoints work correctly

## Naming Conventions

### Files
- Model: `yourPreferences.model.js` (camelCase)
- Controller: `yourPreferences.controller.js` (camelCase)
- Route: `yourPreferences.route.js` (camelCase)

### URLs
- Route path: `/api/preferences/your-preferences` (kebab-case)

### Model Names
- Mongoose model: `YourPreferences` (PascalCase, singular)
- Schema variable: `yourPreferencesSchema` (camelCase)
- Export: `YourPreferences` (PascalCase)

### Controller Functions
- `getYourPreferences`
- `updateYourPreferences`
- `createYourPreferences`

### Variable Names
- Use camelCase: `yourPrefs`, `userPreferences`, etc.

## Special Cases

### If Fields Reference Other Schemas

If a field should be managed in another schema to avoid duplication, add a comment:

```javascript
// Note: displayTypingIndicator is managed in AppearancePreferences
// to avoid duplication. Frontend should reference appearance.displayTypingIndicator
```

The frontend can then reference the field from the other preference category.

### If Subcategory Has Additional Endpoints

Some subcategories may need extra endpoints (like VIP's `/vip-list` routes). Add them to the route file:

```javascript
router.post('/special-action', protectRoute, specialAction);
router.delete('/special-action/:id', protectRoute, deleteSpecialAction);
```

## Examples

### Simple Boolean Fields

See `messagesMediaPreferences.model.js` - simple boolean fields with defaults.

### Enum Fields

See `notificationPreferences.model.js` - has `type` enum validation.

### Array Fields

See `vipPreferences.model.js` - has `vipList` array with validation and separate endpoints for add/remove.

### Complex Fields

See `audioVideoPreferences.model.js` - has device strings and huddle-related boolean/string fields.

## Testing

After implementing a new subcategory, test:

1. GET `/api/preferences/your-preferences` - Should return defaults if not exists
2. POST `/api/preferences/your-preferences` - Should create new preferences
3. PATCH `/api/preferences/your-preferences` - Should update existing preferences
4. PATCH `/api/preferences` with `{ yourPreferences: {...} }` - Should update through main endpoint
5. GET `/api/preferences` - Should include your preferences in response

## Next Subcategories to Implement

Based on `frontend/src/features/preferences/types.ts`, remaining subcategories:

1. **Privacy & Visibility** (`privacyVisibilityPreferences`)
   - Fields: `slackConnectDiscoverable` (boolean), `contactSharing` (enum: 'all' | 'workspace_only' | 'none')

2. **Slack AI** (`slackAIPreferences`)
   - Fields: `streamSummaries` (boolean)

3. **Advanced** (`advancedPreferences`)
   - Multiple fields including: `whenTypingCodeEnterShouldNotSend`, `formatMessagesWithMarkup`, `enterBehavior`, `searchShortcut`, `excludeChannelsFromSearch`, `searchSortDefault`, `confirmUnsend`, `confirmAwayToggle`, `warnMaliciousLinks`, `warnExternalFiles`, `warnExternalCanvases`, `channelSuggestions`, `surveys`

Follow the same pattern for each!

