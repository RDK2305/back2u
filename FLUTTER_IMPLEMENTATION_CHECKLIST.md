# Flutter Conversion - Implementation Checklist

## Pre-Development
- [ ] Install Flutter SDK (v3.10+)
- [ ] Install Dart SDK
- [ ] Install VS Code & Flutter extension
- [ ] Install Android SDK / Xcode
- [ ] Run `flutter doctor` - fix all issues
- [ ] Create new Flutter project: `flutter create back2u_mobile`
- [ ] Test initial setup with `flutter run`

## Phase 1: Project Setup (Week 1)
- [ ] Create project structure in `lib/` folder
- [ ] Create `config/app_config.dart` with API endpoints
- [ ] Create `config/theme.dart` with app theming
- [ ] Create `config/routes.dart` with named routes
- [ ] Update `pubspec.yaml` with all dependencies
- [ ] Run `flutter pub get`
- [ ] Create `main.dart` app entry point
- [ ] Create splash screen (`lib/screens/splash_screen.dart`)
- [ ] Test basic app navigation

## Phase 2: Services Layer (Week 2)
- [ ] Create `services/api_service.dart`
  - [ ] Initialize Dio HTTP client
  - [ ] Add JWT token interceptor
  - [ ] Implement all API endpoints
  - [ ] Add error handling
- [ ] Create `services/auth_service.dart`
  - [ ] Login method
  - [ ] Register method
  - [ ] Email verification
  - [ ] Token management
  - [ ] Logout method
- [ ] Create `services/storage_service.dart`
  - [ ] SharedPreferences initialization
  - [ ] Token get/set/clear
  - [ ] User data storage
  - [ ] Preferences (theme, language)
- [ ] Create `services/image_service.dart`
  - [ ] Camera picker
  - [ ] Gallery picker
  - [ ] Image compression
- [ ] Test all services with mock data

## Phase 3: Data Models (Week 2)
- [ ] Create `models/user.dart`
  - [ ] Properties matching backend User
  - [ ] fromJson/toJson methods
  - [ ] Validation methods
- [ ] Create `models/item.dart`
  - [ ] Properties matching backend Item
  - [ ] fromJson/toJson methods
  - [ ] Category list constants
- [ ] Create `models/claim.dart`
  - [ ] Properties matching backend Claim
  - [ ] fromJson/toJson methods
- [ ] Create `models/api_response.dart` (generic wrapper)
- [ ] Write unit tests for models

## Phase 4: State Management (Week 3)
- [ ] Create `providers/auth_provider.dart`
  - [ ] Login functionality
  - [ ] Register functionality
  - [ ] Logout functionality
  - [ ] User state management
  - [ ] Error handling
- [ ] Create `providers/item_provider.dart`
  - [ ] Fetch items with pagination
  - [ ] Filter/search logic
  - [ ] Create item functionality
  - [ ] Update item
  - [ ] Delete item
- [ ] Create `providers/claim_provider.dart`
  - [ ] Fetch claims
  - [ ] Submit claim
  - [ ] Update claim status
- [ ] Create `providers/search_provider.dart` (optional)
- [ ] Test all providers with GetX

## Phase 5: UI Screens - Authentication (Week 4)
- [ ] Create `screens/splash_screen.dart`
  - [ ] Check auth status on load
  - [ ] Navigate to login or home
- [ ] Create `screens/auth/login_screen.dart`
  - [ ] Email & password fields
  - [ ] Validation
  - [ ] Login button functionality
  - [ ] Link to register
  - [ ] Forgot password link (optional)
- [ ] Create `screens/auth/register_screen.dart`
  - [ ] Name, email, password fields
  - [ ] Password confirmation
  - [ ] Validation
  - [ ] Register button
- [ ] Create `screens/auth/verify_email_screen.dart`
  - [ ] OTP/code input
  - [ ] Resend code functionality
  - [ ] Email verification logic
- [ ] Test auth flow end-to-end

## Phase 5: UI Screens - Items (Week 4-5)
- [ ] Create `screens/items/browse_items_screen.dart`
  - [ ] ItemProvider GetController
  - [ ] ListView with pagination
  - [ ] Pull to refresh
  - [ ] Filter button
  - [ ] Item cards
- [ ] Create `screens/items/item_detail_screen.dart`
  - [ ] Display item details
  - [ ] Image carousel
  - [ ] Submit claim button
  - [ ] Share item functionality (optional)
- [ ] Create `screens/items/report_lost_screen.dart`
  - [ ] Form with item details
  - [ ] Image upload
  - [ ] Date picker for lost date
  - [ ] Submit button
- [ ] Create `screens/items/report_found_screen.dart`
  - [ ] Form with item details
  - [ ] Image upload
  - [ ] Location details
  - [ ] Submit button

## Phase 5: UI Screens - Claims (Week 4-5)
- [ ] Create `screens/claims/my_claims_screen.dart`
  - [ ] List of user's claims
  - [ ] Filter by status
  - [ ] Claim cards with status
- [ ] Create `screens/claims/claim_detail_screen.dart`
  - [ ] Full claim information
  - [ ] Status badge
  - [ ] Verification details
  - [ ] Timeline
- [ ] Create `screens/claims/submit_claim_screen.dart`
  - [ ] Item selection
  - [ ] Claim description
  - [ ] Proof image upload
  - [ ] Personal details
  - [ ] Submit button

## Phase 5: UI Screens - Other (Week 4-5)
- [ ] Create `screens/home/home_screen.dart`
  - [ ] Dashboard overview
  - [ ] Recent items
  - [ ] Quick actions
  - [ ] BottomNavigationBar
- [ ] Create `screens/profile/profile_screen.dart`
  - [ ] User information
  - [ ] Edit profile button
  - [ ] My items & claims tabs
  - [ ] Settings
  - [ ] Logout button
- [ ] Create `screens/dashboard/dashboard_screen.dart` (if security only)
  - [ ] Stats cards
  - [ ] Recent claims to verify
  - [ ] Admin actions

## Phase 5: Reusable Widgets (Week 4-5)
- [ ] Create `widgets/common/custom_app_bar.dart`
- [ ] Create `widgets/common/loading_spinner.dart`
- [ ] Create `widgets/common/error_snackbar.dart`
- [ ] Create `widgets/common/app_drawer.dart`
- [ ] Create `widgets/item_widgets/item_card.dart`
  - [ ] Display item info
  - [ ] Image thumbnail
  - [ ] Category badge
  - [ ] Status indicator
- [ ] Create `widgets/item_widgets/item_filter.dart`
  - [ ] Category dropdown
  - [ ] Status filter
  - [ ] Campus filter
  - [ ] Apply filter button
- [ ] Create `widgets/item_widgets/item_form.dart`
  - [ ] Reusable form for items
  - [ ] Validation
- [ ] Create `widgets/claim_widgets/claim_card.dart`
- [ ] Create `widgets/claim_widgets/claim_form.dart`

## Phase 6: Advanced Features (Week 6)
- [ ] Implement image caching
  - [ ] CachedNetworkImage setup
  - [ ] Custom cache manager
- [ ] Add push notifications (Firebase)
  - [ ] firebase_messaging setup
  - [ ] Handle notifications on app
  - [ ] Notification badges
- [ ] Implement offline support
  - [ ] SQLite local database
  - [ ] Sync when online
  - [ ] Offline indicators
- [ ] Add search functionality
  - [ ] Searchable items list
  - [ ] Advanced filters
  - [ ] Save searches
- [ ] Implement animations
  - [ ] Page transitions
  - [ ] Loading skeletons
  - [ ] Button ripple effects
  - [ ] Lottie animations

## Testing (Week 7)
- [ ] Unit tests
  - [ ] AuthService tests
  - [ ] ItemProvider tests
  - [ ] Model serialization tests
- [ ] Widget tests
  - [ ] LoginScreen tests
  - [ ] ItemCard tests
- [ ] Integration tests
  - [ ] Full auth flow
  - [ ] Item browsing flow
  - [ ] Claim submission flow
- [ ] Manual testing
  - [ ] Test on Android emulator
  - [ ] Test on iOS simulator
  - [ ] Test on physical devices
  - [ ] Test offline scenarios
  - [ ] Test network errors

## Platform-Specific Setup (Week 7-8)
### Android
- [ ] Update `android/app/build.gradle`
  - [ ] Set compileSdkVersion (34+)
  - [ ] Set minSdkVersion (21+)
- [ ] Update `AndroidManifest.xml`
  - [ ] Add internet permission
  - [ ] Add camera permission
  - [ ] Add storage permissions
  - [ ] Update app name and icon
- [ ] Generate signing key for release
- [ ] Test on Android device/emulator

### iOS
- [ ] Update `ios/Podfile`
- [ ] Update `ios/Runner/Info.plist`
  - [ ] Add NSCameraUsageDescription
  - [ ] Add NSPhotoLibraryUsageDescription
  - [ ] Update app name
- [ ] Configure signing in Xcode
- [ ] Update app icon and splash
- [ ] Test on iOS simulator/device

## Build & Release (Week 8)
### Android
- [ ] Build APK: `flutter build apk --release`
- [ ] Build App Bundle: `flutter build appbundle --release`
- [ ] Test APK on physical device
- [ ] Upload to Play Store
  - [ ] Create Google Play Developer account
  - [ ] Set up app listing
  - [ ] Upload APK/AAB
  - [ ] Configure content rating
  - [ ] Set pricing

### iOS
- [ ] Build IPA: `flutter build ipa --release`
- [ ] Test on physical device
- [ ] Upload to App Store
  - [ ] Create Apple Developer account
  - [ ] Generate certificates
  - [ ] Set up app listing
  - [ ] Upload build with Xcode
  - [ ] Configure version info

## Post-Launch
- [ ] Monitor crash logs (Firebase Crashlytics)
- [ ] Track analytics
- [ ] Respond to user reviews
- [ ] Plan version 2 features
- [ ] Continuous improvement

## Dependencies Verification
```bash
# Run this to verify all packages are installed correctly
flutter pub get
flutter pub upgrade
```

### Critical Dependencies Status
- [ ] http or dio
- [ ] get (state management)
- [ ] shared_preferences
- [ ] flutter_secure_storage
- [ ] image_picker
- [ ] cached_network_image
- [ ] intl
- [ ] connectivity_plus

## Quick Command Reference

```bash
# Create project
flutter create back2u_mobile
cd back2u_mobile

# Install dependencies
flutter pub get
flutter pub upgrade

# Run app
flutter run
flutter run -d chrome  # Web
flutter run -d emulator-5554  # Specific device

# Build
flutter build apk --release
flutter build appbundle --release
flutter build ipa --release

# Testing
flutter test
flutter test integration_test/

# Clean build
flutter clean
flutter pub get
flutter run

# DevTools
flutter pub global activate devtools
devtools

# Analyze code
flutter analyze
flutter format .

# Check setup
flutter doctor -v
flutter doctor --android-licenses
```

## File Structure Summary
```
back2u_mobile/
├── lib/
│   ├── config/
│   ├── models/
│   ├── services/
│   ├── providers/
│   ├── screens/
│   ├── widgets/
│   └── main.dart
├── test/
├── integration_test/
├── android/
├── ios/
├── pubspec.yaml
└── README.md
```

## Notes

### Common Issues & Resolutions
1. **API Connection Issues**
   - Update base URL in app_config.dart
   - For Android emulator: use 10.0.2.2:3000
   - For iOS simulator: use localhost:3000

2. **Image Upload Fails**
   - Check file permissions in AndroidManifest.xml
   - Reduce image size before upload
   - Verify backend image handler

3. **State Not Updating**
   - Use .obs for observables with GetX
   - Use Obx() widget for reactivity
   - Verify provider is being initialized

4. **Build Errors**
   - Run `flutter clean`
   - Delete pubspec.lock and run `flutter pub get`
   - Check Dart and Flutter versions

---

**Last Updated**: February 13, 2026  
**Status**: Ready to Start Implementation
