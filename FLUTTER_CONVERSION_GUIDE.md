# Flutter Conversion Guide - Back2u Lost & Found System

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Environment Setup](#environment-setup)
3. [Project Structure](#project-structure)
4. [Step-by-Step Conversion](#step-by-step-conversion)
5. [Backend Integration](#backend-integration)
6. [UI/UX Migration](#uiux-migration)
7. [State Management](#state-management)
8. [Authentication & Security](#authentication--security)
9. [Database & Local Storage](#database--local-storage)
10. [Testing & Debugging](#testing--debugging)
11. [Deployment](#deployment)
12. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Overview & Architecture

### Current Web Stack
- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Database**: MySQL
- **Authentication**: JWT + Bcrypt
- **File Upload**: Multer
- **Styling**: Tailwind CSS

### Flutter Equivalent Stack
- **Backend**: Same (Node.js + Express.js) - NO CHANGES NEEDED
- **Frontend**: Flutter (Dart)
- **Local Storage**: SQLite (optional) or SharedPreferences
- **Authentication**: JWT tokens stored securely
- **File Upload**: http package + file picker
- **Styling**: Flutter Material Design + Custom Widgets

### Key Advantages of Flutter Migration
✅ Native mobile experience for iOS & Android  
✅ Single codebase for multiple platforms  
✅ Better performance than web app  
✅ Offline capabilities  
✅ Push notifications support  
✅ Access to device features (camera, location, contacts)  

---

## Environment Setup

### Prerequisites
- **Flutter SDK** (v3.10+): [Download](https://flutter.dev/docs/get-started/install)
- **Dart SDK** (included with Flutter)
- **VS Code** or **Android Studio**
- **Android SDK** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Git**

### Installation Steps

#### 1. Install Flutter
```bash
# Download Flutter SDK from https://flutter.dev/docs/get-started/install
# Extract to a folder (e.g., C:\flutter)

# Add Flutter to PATH (Windows)
# Edit System Environment Variables → Add C:\flutter\bin to PATH

# Verify installation
flutter doctor
```

#### 2. Install VS Code Extensions
```
- Flutter (Dart Code)
- Dart (Dart Code)
- Better Comments
- Error Lens
- REST Client (for testing APIs)
```

#### 3. Verify Setup
```bash
flutter doctor

# Resolve any issues shown, especially:
# - Android Studio setup
# - Android licenses
# - Xcode setup (macOS)
```

#### 4. Create New Flutter Project
```bash
flutter create back2u_mobile
cd back2u_mobile

# Run on connected device/emulator
flutter run
```

---

## Project Structure

### Organized Flutter Project Layout
```
back2u_mobile/
├── lib/
│   ├── main.dart                      # App entry point
│   ├── config/
│   │   ├── app_config.dart           # API endpoints, constants
│   │   ├── theme.dart                # App theming
│   │   └── routes.dart               # Named routes
│   ├── models/
│   │   ├── user.dart
│   │   ├── item.dart
│   │   ├── claim.dart
│   │   └── api_response.dart         # Generic API response wrapper
│   ├── services/
│   │   ├── api_service.dart          # HTTP client, API calls
│   │   ├── auth_service.dart         # Authentication logic
│   │   ├── storage_service.dart      # Local storage (SharedPreferences)
│   │   ├── image_service.dart        # Image upload, compression
│   │   └── notification_service.dart # Push notifications
│   ├── providers/                    # State management (GetX or Provider)
│   │   ├── auth_provider.dart
│   │   ├── item_provider.dart
│   │   ├── claim_provider.dart
│   │   └── search_provider.dart
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   ├── register_screen.dart
│   │   │   └── verify_email_screen.dart
│   │   ├── home/
│   │   │   ├── home_screen.dart
│   │   │   └── dashboard_screen.dart
│   │   ├── items/
│   │   │   ├── browse_items_screen.dart
│   │   │   ├── item_detail_screen.dart
│   │   │   ├── report_lost_screen.dart
│   │   │   └── report_found_screen.dart
│   │   ├── claims/
│   │   │   ├── my_claims_screen.dart
│   │   │   ├── claim_detail_screen.dart
│   │   │   └── submit_claim_screen.dart
│   │   └── profile/
│   │       └── profile_screen.dart
│   └── widgets/
│       ├── common/
│       │   ├── app_drawer.dart
│       │   ├── loading_spinner.dart
│       │   ├── error_snackbar.dart
│       │   └── custom_app_bar.dart
│       └── item_widgets/
│           ├── item_card.dart
│           ├── item_filter.dart
│           └── item_form.dart
├── pubspec.yaml                      # Dependencies
└── README.md
```

---

## Step-by-Step Conversion

### Phase 1: Project Setup & Configuration (Week 1)

#### Step 1.1: Initialize Flutter Project
```bash
flutter create back2u_mobile
cd back2u_mobile
```

#### Step 1.2: Add Dependencies to `pubspec.yaml`
```yaml
name: back2u_mobile
description: Lost & Found System Mobile App
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # HTTP & API
  http: ^1.1.0
  dio: ^5.3.0           # Alternative to http, more features
  
  # State Management
  get: ^4.6.5           # GetX - lightweight state management
  # OR use Provider: provider: ^6.0.0
  
  # Local Storage
  shared_preferences: ^2.2.0
  sqflite: ^2.3.0       # SQLite for local caching
  path_provider: ^2.1.0
  
  # Authentication
  flutter_secure_storage: ^9.0.0  # Secure token storage
  jwt_decoder: ^2.0.1
  
  # Image Handling
  image_picker: ^1.0.0
  cached_network_image: ^3.3.0
  image: ^4.0.0         # Image compression
  
  # DateTime & Formatting
  intl: ^0.18.0
  timeago: ^3.5.0
  
  # Navigation & Routing
  get_storage: ^2.1.1
  
  # UI Components
  shimmer: ^3.0.0       # Skeleton loaders
  lottie: ^2.4.0        # Animations
  flutter_spinkit: ^5.2.0
  badges: ^3.1.0
  
  # Others
  connectivity_plus: ^5.0.0   # Check internet connection
  uuid: ^4.0.0                # Generate unique IDs
  url_launcher: ^6.1.0        # Open external URLs

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_linter:
  integration_test:
    sdk: flutter

flutter:
  uses-material-design: true
```

#### Step 1.3: Basic App Configuration (`lib/config/app_config.dart`)
```dart
class AppConfig {
  // API Configuration
  static const String baseUrl = 'http://your-backend-url:3000/api';
  // For development: 'http://192.168.x.x:3000/api'
  // For production: 'https://yourdomain.com/api'
  
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String itemsEndpoint = '/items';
  static const String claimsEndpoint = '/claims';
  
  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration imageUploadTimeout = Duration(minutes: 5);
  
  // Image Configuration
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const int imageQuality = 85;
  
  // Pagination
  static const int itemsPerPage = 10;
  
  // Email Validation
  static const String emailPattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String refreshTokenKey = 'refresh_token';
}
```

#### Step 1.4: Theme Configuration (`lib/config/theme.dart`)
```dart
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF2563EB), // Primary blue
      brightness: Brightness.light,
    ),
    appBarTheme: const AppBarTheme(
      elevation: 0,
      centerTitle: true,
      backgroundColor: Colors.white,
      foregroundColor: Colors.black,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.grey[100],
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.all(16),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
  );
  
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF2563EB),
      brightness: Brightness.dark,
    ),
  );
}
```

#### Step 1.5: Main App Entry Point (`lib/main.dart`)
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'config/app_config.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'services/storage_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize local storage
  await StorageService.init();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Back2u - Lost & Found',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      initialRoute: '/splash',
      getPages: AppRoutes.routes,
    );
  }
}
```

---

### Phase 2: Service Layer & API Integration (Week 2)

#### Step 2.1: API Service (`lib/services/api_service.dart`)
```dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/app_config.dart';
import '../services/storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  late Dio _dio;
  
  factory ApiService() {
    return _instance;
  }
  
  ApiService._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.baseUrl,
        connectTimeout: AppConfig.apiTimeout,
        receiveTimeout: AppConfig.apiTimeout,
        headers: {
          'Content-Type': 'application/json',
        },
      ),
    );
    
    // Add interceptor for JWT tokens
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          String? token = StorageService.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Token expired - handle refresh or logout
            StorageService.clearToken();
          }
          return handler.next(error);
        },
      ),
    );
  }
  
  // Authentication Endpoints
  Future<Response> login(String email, String password) async {
    try {
      return await _dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> register(String name, String email, String password) async {
    try {
      return await _dio.post(
        '/auth/register',
        data: {'name': name, 'email': email, 'password': password},
      );
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> verifyEmail(String email, String code) async {
    try {
      return await _dio.post(
        '/auth/verify-email',
        data: {'email': email, 'code': code},
      );
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  // Items Endpoints
  Future<Response> getItems({
    int page = 1,
    String? category,
    String? status,
    String? campus,
  }) async {
    try {
      return await _dio.get(
        '/items',
        queryParameters: {
          'page': page,
          if (category != null) 'category': category,
          if (status != null) 'status': status,
          if (campus != null) 'campus': campus,
        },
      );
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> getItemById(int itemId) async {
    try {
      return await _dio.get('/items/$itemId');
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> createItem(Map<String, dynamic> data, List<String>? imagePaths) async {
    try {
      FormData formData = FormData.fromMap(data);
      
      if (imagePaths != null) {
        for (String path in imagePaths) {
          formData.files.add(
            MapEntry('images', await MultipartFile.fromFile(path)),
          );
        }
      }
      
      return await _dio.post('/items', data: formData);
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> updateItem(int itemId, Map<String, dynamic> data) async {
    try {
      return await _dio.put('/items/$itemId', data: data);
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> deleteItem(int itemId) async {
    try {
      return await _dio.delete('/items/$itemId');
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  // Claims Endpoints
  Future<Response> getClaims() async {
    try {
      return await _dio.get('/claims');
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> getClaimById(int claimId) async {
    try {
      return await _dio.get('/claims/$claimId');
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> submitClaim(Map<String, dynamic> data) async {
    try {
      return await _dio.post('/claims', data: data);
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> updateClaim(int claimId, Map<String, dynamic> data) async {
    try {
      return await _dio.put('/claims/$claimId', data: data);
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  // User Endpoints
  Future<Response> getUserProfile() async {
    try {
      return await _dio.get('/auth/profile');
    } on DioException catch (e) {
      rethrow;
    }
  }
  
  Future<Response> updateProfile(Map<String, dynamic> data) async {
    try {
      return await _dio.put('/auth/profile', data: data);
    } on DioException catch (e) {
      rethrow;
    }
  }
}
```

#### Step 2.2: Authentication Service (`lib/services/auth_service.dart`)
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  final _secureStorage = const FlutterSecureStorage();
  final _apiService = ApiService();
  
  factory AuthService() {
    return _instance;
  }
  
  AuthService._internal();
  
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user';
  
  // Login
  Future<User> login(String email, String password) async {
    try {
      final response = await _apiService.login(email, password);
      
      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        final user = User.fromJson(data['user']);
        
        // Save token securely
        await _secureStorage.write(key: _tokenKey, value: token);
        
        return user;
      }
      throw Exception('Login failed');
    } catch (e) {
      rethrow;
    }
  }
  
  // Register
  Future<void> register(String name, String email, String password) async {
    try {
      final response = await _apiService.register(name, email, password);
      
      if (response.statusCode != 201) {
        throw Exception('Registration failed');
      }
    } catch (e) {
      rethrow;
    }
  }
  
  // Verify Email
  Future<void> verifyEmail(String email, String code) async {
    try {
      final response = await _apiService.verifyEmail(email, code);
      
      if (response.statusCode == 200) {
        final token = response.data['token'];
        await _secureStorage.write(key: _tokenKey, value: token);
      }
    } catch (e) {
      rethrow;
    }
  }
  
  // Get Token
  Future<String?> getToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }
  
  // Check if Token is Valid
  Future<bool> isTokenValid() async {
    try {
      String? token = await getToken();
      if (token == null) return false;
      
      return !JwtDecoder.isExpired(token);
    } catch (e) {
      return false;
    }
  }
  
  // Logout
  Future<void> logout() async {
    await _secureStorage.delete(key: _tokenKey);
  }
  
  // Get Current User
  Future<User?> getCurrentUser() async {
    try {
      final response = await _apiService.getUserProfile();
      if (response.statusCode == 200) {
        return User.fromJson(response.data['user']);
      }
    } catch (e) {
      return null;
    }
  }
}
```

#### Step 2.3: Storage Service (`lib/services/storage_service.dart`)
```dart
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static late SharedPreferences _prefs;
  
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }
  
  // Token Management
  static String? getToken() {
    return _prefs.getString('auth_token');
  }
  
  static Future<void> setToken(String token) async {
    await _prefs.setString('auth_token', token);
  }
  
  static Future<void> clearToken() async {
    await _prefs.remove('auth_token');
  }
  
  // User Data
  static String? getUserData(String key) {
    return _prefs.getString('user_$key');
  }
  
  static Future<void> setUserData(String key, String value) async {
    await _prefs.setString('user_$key', value);
  }
  
  static Future<void> clearUserData() async {
    final List<String> userKeys = _prefs.getKeys()
        .where((key) => key.startsWith('user_'))
        .toList();
    for (String key in userKeys) {
      await _prefs.remove(key);
    }
  }
  
  // Preferences
  static bool isDarkMode() {
    return _prefs.getBool('dark_mode') ?? false;
  }
  
  static Future<void> setDarkMode(bool isDark) async {
    await _prefs.setBool('dark_mode', isDark);
  }
  
  static String getLanguage() {
    return _prefs.getString('language') ?? 'en';
  }
  
  static Future<void> setLanguage(String language) async {
    await _prefs.setString('language', language);
  }
  
  // Cache Management
  static Future<void> clearCache() async {
    await _prefs.clear();
  }
}
```

---

### Phase 3: Data Models (Week 2)

#### Step 3.1: User Model (`lib/models/user.dart`)
```dart
class User {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? campus;
  final String? role; // 'student' or 'security'
  final bool emailVerified;
  final DateTime createdAt;
  
  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.campus,
    this.role,
    required this.emailVerified,
    required this.createdAt,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      campus: json['campus'],
      role: json['role'],
      emailVerified: json['emailVerified'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'campus': campus,
      'role': role,
      'emailVerified': emailVerified,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
```

#### Step 3.2: Item Model (`lib/models/item.dart`)
```dart
class Item {
  final int id;
  final String title;
  final String description;
  final String category;
  final String type; // 'lost' or 'found'
  final String status; // 'active', 'claimed', 'resolved'
  final String campus;
  final String? locationDetails;
  final List<String>? imageUrls;
  final int userId;
  final DateTime createdAt;
  final DateTime? updatedAt;
  
  Item({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.type,
    required this.status,
    required this.campus,
    this.locationDetails,
    this.imageUrls,
    required this.userId,
    required this.createdAt,
    this.updatedAt,
  });
  
  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      category: json['category'],
      type: json['type'],
      status: json['status'],
      campus: json['campus'],
      locationDetails: json['locationDetails'],
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      userId: json['userId'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'category': category,
      'type': type,
      'campus': campus,
      'locationDetails': locationDetails,
    };
  }
}
```

#### Step 3.3: Claim Model (`lib/models/claim.dart`)
```dart
class Claim {
  final int id;
  final int itemId;
  final int userId;
  final String status; // 'pending', 'approved', 'rejected'
  final String description;
  final String? proofImage;
  final DateTime submittedAt;
  final DateTime? verifiedAt;
  final String? verifiedBy;
  
  Claim({
    required this.id,
    required this.itemId,
    required this.userId,
    required this.status,
    required this.description,
    this.proofImage,
    required this.submittedAt,
    this.verifiedAt,
    this.verifiedBy,
  });
  
  factory Claim.fromJson(Map<String, dynamic> json) {
    return Claim(
      id: json['id'],
      itemId: json['itemId'],
      userId: json['userId'],
      status: json['status'],
      description: json['description'],
      proofImage: json['proofImage'],
      submittedAt: DateTime.parse(json['submittedAt']),
      verifiedAt: json['verifiedAt'] != null ? DateTime.parse(json['verifiedAt']) : null,
      verifiedBy: json['verifiedBy'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'itemId': itemId,
      'description': description,
    };
  }
}
```

---

### Phase 4: State Management with GetX (Week 3)

#### Step 4.1: Auth Provider/Controller (`lib/providers/auth_provider.dart`)
```dart
import 'package:get/get.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider extends GetxController {
  final _authService = AuthService();
  
  final isLoggedIn = false.obs;
  final isLoading = false.obs;
  final user = Rx<User?>(null);
  final error = Rx<String?>(null);
  
  @override
  void onInit() {
    super.onInit();
    checkAuthStatus();
  }
  
  Future<void> checkAuthStatus() async {
    isLoading.value = true;
    bool isValid = await _authService.isTokenValid();
    if (isValid) {
      user.value = await _authService.getCurrentUser();
      isLoggedIn.value = true;
    }
    isLoading.value = false;
  }
  
  Future<bool> login(String email, String password) async {
    try {
      isLoading.value = true;
      error.value = null;
      
      user.value = await _authService.login(email, password);
      isLoggedIn.value = true;
      
      return true;
    } catch (e) {
      error.value = e.toString();
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<bool> register(String name, String email, String password) async {
    try {
      isLoading.value = true;
      error.value = null;
      
      await _authService.register(name, email, password);
      return true;
    } catch (e) {
      error.value = e.toString();
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<void> logout() async {
    await _authService.logout();
    user.value = null;
    isLoggedIn.value = false;
  }
}
```

#### Step 4.2: Item Provider/Controller (`lib/providers/item_provider.dart`)
```dart
import 'package:get/get.dart';
import '../models/item.dart';
import '../services/api_service.dart';

class ItemProvider extends GetxController {
  final _apiService = ApiService();
  
  final items = <Item>[].obs;
  final isLoading = false.obs;
  final error = Rx<String?>(null);
  final currentPage = 1.obs;
  final hasMoreItems = true.obs;
  
  // Filters
  final selectedCategory = Rx<String?>(null);
  final selectedStatus = Rx<String?>(null);
  final selectedCampus = Rx<String?>(null);
  
  List<String> categories = [
    'Electronics', 'Clothing', 'Books', 'Keys', 'Wallets', 'Other'
  ];
  
  List<String> statuses = ['active', 'claimed', 'resolved'];
  
  Future<void> getItems({
    int page = 1,
    bool refresh = false,
  }) async {
    try {
      if (refresh) {
        currentPage.value = 1;
        items.clear();
      }
      
      isLoading.value = true;
      error.value = null;
      
      final response = await _apiService.getItems(
        page: page,
        category: selectedCategory.value,
        status: selectedStatus.value,
        campus: selectedCampus.value,
      );
      
      if (response.statusCode == 200) {
        List<dynamic> data = response.data['items'] ?? [];
        List<Item> newItems = data.map((item) => Item.fromJson(item)).toList();
        
        if (refresh) {
          items.value = newItems;
        } else {
          items.addAll(newItems);
        }
        
        hasMoreItems.value = newItems.length >= 10;
        currentPage.value = page;
      }
    } catch (e) {
      error.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<Item?> getItemById(int itemId) async {
    try {
      final response = await _apiService.getItemById(itemId);
      if (response.statusCode == 200) {
        return Item.fromJson(response.data['item']);
      }
    } catch (e) {
      error.value = e.toString();
    }
    return null;
  }
  
  Future<bool> createItem(Item item, List<String> imagePaths) async {
    try {
      isLoading.value = true;
      error.value = null;
      
      final response = await _apiService.createItem(
        item.toJson(),
        imagePaths.isNotEmpty ? imagePaths : null,
      );
      
      if (response.statusCode == 201) {
        items.insert(0, Item.fromJson(response.data['item']));
        return true;
      }
      return false;
    } catch (e) {
      error.value = e.toString();
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  void setFilter(String? category, String? status, String? campus) {
    selectedCategory.value = category;
    selectedStatus.value = status;
    selectedCampus.value = campus;
    getItems(refresh: true);
  }
}
```

---

### Phase 5: UI Screens (Week 4-5)

#### Step 5.1: Login Screen (`lib/screens/auth/login_screen.dart`)
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late TextEditingController emailController;
  late TextEditingController passwordController;
  final AuthProvider authProvider = Get.put(AuthProvider());
  bool obscurePassword = true;
  
  @override
  void initState() {
    super.initState();
    emailController = TextEditingController();
    passwordController = TextEditingController();
  }
  
  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }
  
  void handleLogin() async {
    if (emailController.text.isEmpty || passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }
    
    bool success = await authProvider.login(
      emailController.text,
      passwordController.text,
    );
    
    if (success) {
      Get.offAllNamed('/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authProvider.error.value ?? 'Login failed')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 50),
                const Text(
                  'Back2u',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Lost & Found System',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
                const SizedBox(height: 40),
                TextField(
                  controller: emailController,
                  decoration: InputDecoration(
                    hintText: 'Email',
                    prefixIcon: const Icon(Icons.email),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: passwordController,
                  decoration: InputDecoration(
                    hintText: 'Password',
                    prefixIcon: const Icon(Icons.lock),
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscurePassword ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () {
                        setState(() {
                          obscurePassword = !obscurePassword;
                        });
                      },
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  obscureText: obscurePassword,
                ),
                const SizedBox(height: 24),
                Obx(() => SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: authProvider.isLoading.value ? null : handleLogin,
                    child: authProvider.isLoading.value
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Login'),
                  ),
                )),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account? "),
                    GestureDetector(
                      onTap: () => Get.toNamed('/register'),
                      child: const Text(
                        'Register',
                        style: TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

#### Step 5.2: Browse Items Screen (`lib/screens/items/browse_items_screen.dart`)
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../providers/item_provider.dart';
import '../../widgets/item_widgets/item_card.dart';

class BrowseItemsScreen extends StatefulWidget {
  const BrowseItemsScreen({Key? key}) : super(key: key);

  @override
  State<BrowseItemsScreen> createState() => _BrowseItemsScreenState();
}

class _BrowseItemsScreenState extends State<BrowseItemsScreen> {
  final ItemProvider itemProvider = Get.put(ItemProvider());
  late ScrollController _scrollController;
  
  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    itemProvider.getItems(refresh: true);
  }
  
  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
  
  void _onScroll() {
    if (_scrollController.position.pixels ==
        _scrollController.position.maxScrollExtent) {
      if (itemProvider.hasMoreItems.value) {
        itemProvider.getItems(page: itemProvider.currentPage.value + 1);
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Browse Items'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Obx(() {
        if (itemProvider.isLoading.value && itemProvider.items.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }
        
        if (itemProvider.items.isEmpty) {
          return const Center(child: Text('No items found'));
        }
        
        return ListView.builder(
          controller: _scrollController,
          itemCount: itemProvider.items.length + 1,
          itemBuilder: (context, index) {
            if (index == itemProvider.items.length) {
              return itemProvider.isLoading.value
                  ? const Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(),
                    )
                  : const SizedBox.shrink();
            }
            
            return ItemCard(item: itemProvider.items[index]);
          },
        );
      }),
    );
  }
  
  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Items'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButton<String?>(
              value: itemProvider.selectedCategory.value,
              hint: const Text('Select Category'),
              items: [null, ...itemProvider.categories]
                  .map((cat) => DropdownMenuItem(
                        value: cat,
                        child: Text(cat ?? 'All Categories'),
                      ))
                  .toList(),
              onChanged: (value) {
                itemProvider.setFilter(
                  value,
                  itemProvider.selectedStatus.value,
                  itemProvider.selectedCampus.value,
                );
              },
            ),
            const SizedBox(height: 16),
            DropdownButton<String?>(
              value: itemProvider.selectedStatus.value,
              hint: const Text('Select Status'),
              items: [null, ...itemProvider.statuses]
                  .map((status) => DropdownMenuItem(
                        value: status,
                        child: Text(status ?? 'All Status'),
                      ))
                  .toList(),
              onChanged: (value) {
                itemProvider.setFilter(
                  itemProvider.selectedCategory.value,
                  value,
                  itemProvider.selectedCampus.value,
                );
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
```

---

### Phase 6: Advanced Features (Week 6)

#### Step 6.1: Image Picker & Upload Service
```dart
// lib/services/image_service.dart
import 'package:image_picker/image_picker.dart';
import 'package:image/image.dart' as img;
import 'dart:io';

class ImageService {
  static final ImageService _instance = ImageService._internal();
  final ImagePicker _picker = ImagePicker();
  
  factory ImageService() {
    return _instance;
  }
  
  ImageService._internal();
  
  Future<File?> pickImageFromCamera() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.camera);
      if (image != null) {
        return await _compressImage(File(image.path));
      }
    } catch (e) {
      print('Error picking image from camera: $e');
    }
    return null;
  }
  
  Future<File?> pickImageFromGallery() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        return await _compressImage(File(image.path));
      }
    } catch (e) {
      print('Error picking image from gallery: $e');
    }
    return null;
  }
  
  Future<List<File>> pickMultipleImages() async {
    try {
      final List<XFile> images = await _picker.pickMultiImage();
      List<File> compressedImages = [];
      
      for (XFile image in images) {
        File? compressed = await _compressImage(File(image.path));
        if (compressed != null) {
          compressedImages.add(compressed);
        }
      }
      
      return compressedImages;
    } catch (e) {
      print('Error picking images: $e');
      return [];
    }
  }
  
  Future<File?> _compressImage(File imageFile) async {
    try {
      final bytes = imageFile.readAsBytesSync();
      final image = img.decodeImage(bytes);
      
      if (image == null) return imageFile;
      
      // Resize if too large
      img.Image resized = img.copyResize(image, width: 1200, height: 1200);
      
      // Save compressed image
      final compressedFile = File(
        imageFile.path.replaceAll('.jpg', '_compressed.jpg')
      );
      compressedFile.writeAsBytesSync(img.encodeJpg(resized, quality: 85));
      
      return compressedFile;
    } catch (e) {
      print('Error compressing image: $e');
      return imageFile;
    }
  }
}
```

---

## Backend Integration

### No Backend Changes Needed!
Your Node.js/Express backend can be used **as-is** for the Flutter app. The API endpoints remain the same:

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/verify-email
GET    /api/auth/profile
PUT    /api/auth/profile

GET    /api/items
POST   /api/items
GET    /api/items/:id
PUT    /api/items/:id
DELETE /api/items/:id

GET    /api/claims
POST   /api/claims
GET    /api/claims/:id
PUT    /api/claims/:id
```

### Only Update Required:
Update your API base URL in `lib/config/app_config.dart`:
```dart
// For development (Android emulator)
static const String baseUrl = 'http://10.0.2.2:3000/api';

// For development (iOS simulator)
// static const String baseUrl = 'http://localhost:3000/api';

// For production
// static const String baseUrl = 'https://yourdomain.com/api';
```

---

## UI/UX Migration

### Mapping Web Pages to Screens

| Web Page | Flutter Screen | Widgets |
|----------|---|---|
| index.html | HomeScreen | AppBar, BottomNavBar |
| login.html | LoginScreen | TextField, ElevatedButton |
| register.html | RegisterScreen | Form, Validation |
| browse-found.html | BrowseItemsScreen | ListView, ItemCard |
| report-lost.html | ReportItemScreen | Form, ImagePicker |
| my-claims.html | MyClaimsScreen | ListView, ClaimCard |
| profile.html | ProfileScreen | ListTile, Avatar |
| dashboard.html | DashboardScreen | Cards, Charts |

### Key UI Differences

**Web → Flutter**
- HTML forms → Flutter Form with TextField
- CSS styling → Flutter widgets & ThemeData
- JavaScript event handlers → Flutter callbacks
- HTML tables → DataTable or ListView
- CSS animations → Flutter animations & Lottie

### Common Widgets You'll Use

```dart
// Containers & Layout
Container, Column, Row, Stack, Positioned

// Input
TextField, TextFormField, DropdownButton, Checkbox, Radio

// Navigation
Navigator, BottomNavigationBar, Drawer, TabBar

// Display
Text, Image, Card, ListTile, GridView, ListView

// Feedback
SnackBar, Dialog, AlertDialog, LinearProgressIndicator

// Buttons
ElevatedButton, TextButton, IconButton, FloatingActionButton
```

---

## State Management

### Why GetX?
- Lightweight and fast
- Easy dependency injection
- Reactive programming with RxDart
- Named routes built-in
- Context-less navigation

### Alternative: Provider Package
If you prefer Provider over GetX, the pattern is similar but requires BuildContext.

---

## Authentication & Security

### Token Storage
- **DO NOT** use SharedPreferences for tokens
- **DO** use FlutterSecureStorage
- **DO** validate token expiry before API calls
- **DO** implement automatic token refresh

```dart
// Secure Storage Example
final secureStorage = FlutterSecureStorage();
await secureStorage.write(key: 'auth_token', value: token);
String? token = await secureStorage.read(key: 'auth_token');
```

### HTTPS Only
- Use HTTPS in production
- Implement certificate pinning for sensitive APIs
- Validate server certificates

---

## Database & Local Storage

### SQLite for Offline Support (Optional)
```bash
flutter pub add sqflite path_provider
```

```dart
// Example local caching
import 'package:sqflite/sqflite.dart';

class LocalItemDatabase {
  static final LocalItemDatabase _instance = LocalItemDatabase._internal();
  late Database _db;
  
  factory LocalItemDatabase() {
    return _instance;
  }
  
  LocalItemDatabase._internal();
  
  Future<void> init() async {
    _db = await openDatabase(
      'back2u.db',
      version: 1,
      onCreate: (db, version) {
        db.execute('''
          CREATE TABLE items (
            id INTEGER PRIMARY KEY,
            title TEXT,
            description TEXT,
            category TEXT,
            type TEXT,
            status TEXT,
            campus TEXT,
            imageUrls TEXT,
            createdAt TEXT
          )
        ''');
      },
    );
  }
  
  Future<void> insertItem(Item item) async {
    await _db.insert('items', {
      'id': item.id,
      'title': item.title,
      'description': item.description,
      'category': item.category,
      'type': item.type,
      'status': item.status,
      'campus': item.campus,
      'imageUrls': item.imageUrls?.join(','),
      'createdAt': item.createdAt.toIso8601String(),
    });
  }
  
  Future<List<Item>> getItems() async {
    final List<Map<String, dynamic>> maps = await _db.query('items');
    return List.generate(maps.length, (i) {
      return Item.fromJson({...maps[i], 'imageUrls': maps[i]['imageUrls']?.split(',')});
    });
  }
}
```

---

## Testing & Debugging

### Unit Tests
```bash
flutter test
```

```dart
// test/services/auth_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:back2u_mobile/services/auth_service.dart';

void main() {
  group('AuthService', () {
    late AuthService authService;
    
    setUp(() {
      authService = AuthService();
    });
    
    test('Login returns user on success', () async {
      // Mock API response
      // final user = await authService.login('test@example.com', 'password');
      // expect(user.email, 'test@example.com');
    });
  });
}
```

### Integration Tests
```bash
flutter test integration_test/app_test.dart
```

### Debugging

**VS Code Debugging**
1. Set breakpoints in code
2. Run: `flutter run -d <device_id>`
3. Use Debug Console for stepping through code

**DevTools**
```bash
flutter pub global activate devtools
devtools
```

---

## Deployment

### Android Release Build
```bash
# Build APK
flutter build apk --release

# Build App Bundle (recommended for Play Store)
flutter build appbundle --release
```

### iOS Release Build
```bash
# Build IPA
flutter build ios --release

# Create signed IPA
flutter build ipa --release
```

### Play Store Deployment
1. Create Google Play Developer account
2. Generate signing keys:
   ```bash
   keytool -genkey -v -keystore ~/.keystore/back2u-key.jks \
     -keyalg RSA -keysize 2048 -validity 10000 -alias back2u
   ```
3. Configure signing in `android/app/build.gradle`
4. Build and upload to Play Store

### App Store Deployment
1. Create Apple Developer account
2. Configure signing in Xcode
3. Build and upload with Xcode or fastlane

---

## Common Issues & Troubleshooting

### Issue 1: API Connection Fails
**Cause**: Backend not accessible from mobile device  
**Solution**:
```dart
// Use correct IP for emulator
// Android: http://10.0.2.2:3000/api
// iOS: http://localhost:3000/api
// Physical device: http://<your-machine-ip>:3000/api
```

### Issue 2: Image Upload Fails
**Cause**: File too large or incorrect format  
**Solution**:
```dart
// Ensure image compression before upload
// Check file permissions in AndroidManifest.xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Issue 3: JWT Token Expired
**Cause**: Old token still being used  
**Solution**:
```dart
// Implement token refresh
// Check token expiry before each request
// Auto-logout and redirect to login on 401
```

### Issue 4: Build Errors
```bash
# Clean build
flutter clean
flutter pub get
flutter pub upgrade
flutter run

# Check for issues
flutter doctor -v
```

---

## Performance Optimization

### Memory Management
```dart
// Dispose resources
@override
void dispose() {
  controller.dispose();
  scrollController.removeListener(_onScroll);
  super.dispose();
}

// Use const constructors
const MyWidget();
```

### Image Optimization
```dart
// Cache images
CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => Shimmer.fromColors(...),
  errorWidget: (context, url, error) => Icon(Icons.error),
  cacheManager: customCacheManager,
)
```

### Data Fetching
```dart
// Paginate instead of fetching all
// Use local caching
// Lazy load images
// Compress API responses
```

---

## Next Steps

1. **Week 1**: Complete Phase 1 (Setup & Configuration)
2. **Week 2**: Complete Phase 2 & 3 (Services & Models)
3. **Week 3**: Implement Phase 4 (State Management)
4. **Week 4-5**: Build Phase 5 (UI Screens)
5. **Week 6**: Implement Phase 6 (Advanced Features)
6. **Week 7**: Testing & Bug Fixes
7. **Week 8**: Deployment

---

## Resources & Links

- **Flutter Docs**: https://flutter.dev/docs
- **Dart Docs**: https://dart.dev/guides
- **GetX Documentation**: https://github.com/jonataslaw/getx
- **Material Design**: https://material.io/design
- **Firebase for Notifications**: https://firebase.flutter.dev

---

## Support & Questions

For issues or questions during migration:
1. Check Flutter documentation
2. Review GetX examples on GitHub
3. Search StackOverflow for similar issues
4. Consult official Flutter community forum

---

**Last Updated**: February 13, 2026  
**Document Version**: 1.0
