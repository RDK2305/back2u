# Web to Flutter - Component Mapping & Quick Reference

## HTML → Flutter Widget Mapping

### Basic Layout
| HTML | Flutter | Example |
|------|---------|---------|
| `<div>` | `Container` or `Column`/`Row` | `Container(child: Text(''))` |
| `<header>` | `AppBar` | `AppBar(title: Text(''))` |
| `<nav>` | `BottomNavigationBar` or `Drawer` | `BottomNavigationBar(items: [...])` |
| `<main>` | `Scaffold` body | `Scaffold(body: MainContent())` |
| `<footer>` | `BottomAppBar` or `Container` | `BottomAppBar(child: ...)` |
| `<section>` | `Column` or `Card` | `Card(child: Column(...))` |

### Text & Content
| HTML | Flutter | Example |
|------|---------|---------|
| `<p>` | `Text` | `Text('Hello')` |
| `<h1>`, `<h2>`, etc. | `Text` with style | `Text('Title', style: Theme.of(context).textTheme.headlineLarge)` |
| `<a>` | `GestureDetector` or `TextButton` | `GestureDetector(onTap: () {}, child: Text('Link'))` |
| `<img>` | `Image` | `Image.network('url')` or `Image.asset('path')` |
| `<span>` | `Text` | `Text('span text')` |

### Forms & Input
| HTML | Flutter | Example |
|------|---------|---------|
| `<input type="text">` | `TextField` | `TextField(decoration: InputDecoration(hintText: 'Email'))` |
| `<input type="password">` | `TextField` with obscure | `TextField(obscureText: true)` |
| `<input type="email">` | `TextField` | `TextField(keyboardType: TextInputType.emailAddress)` |
| `<input type="number">` | `TextField` | `TextField(keyboardType: TextInputType.number)` |
| `<input type="date">` | `DatePicker` + `TextField` | `showDatePicker(context: context, ...)` |
| `<textarea>` | `TextField` | `TextField(maxLines: null, minLines: 5)` |
| `<select>` | `DropdownButton` | `DropdownButton(items: [...], onChanged: (value) {})` |
| `<checkbox>` | `Checkbox` | `Checkbox(value: true, onChanged: (val) {})` |
| `<radio>` | `Radio` | `Radio(value: 1, groupValue: selected, onChanged: (val) {})` |
| `<button>` | `ElevatedButton` | `ElevatedButton(onPressed: () {}, child: Text('Click'))` |
| `<button type="submit">` | `ElevatedButton` | `ElevatedButton(onPressed: _submit, child: Text('Submit'))` |

### Lists & Grids
| HTML | Flutter | Example |
|------|---------|---------|
| `<ul>` / `<ol>` | `ListView` | `ListView(children: [...])` |
| `<li>` | `ListTile` | `ListTile(title: Text('Item'))` |
| `<table>` | `DataTable` or `ListView` | `DataTable(columns: [...], rows: [...])` |
| CSS Grid | `GridView` | `GridView(gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(...), children: [...])` |

### Cards & Containers
| HTML | Flutter | Example |
|------|---------|---------|
| `<article>` | `Card` | `Card(child: Column(...))` |
| `<div class="card">` | `Card` | `Card(elevation: 4, child: ...)` |
| Box with border | `Card` or `Container` | `Container(decoration: BoxDecoration(border: ...))` |
| Box with shadow | `Card` or `Container` | `Card(elevation: 8, child: ...)` |

### Navigation
| HTML | Flutter | Example |
|------|---------|---------|
| Page navigation | `Navigator.push()` | `Navigator.push(context, MaterialPageRoute(builder: (_) => Screen()))` |
| Named routes | `Get.toNamed()` | `Get.toNamed('/home')` |
| Back button | `Navigator.pop()` | `Navigator.pop(context)` |
| Tabs | `TabBar` + `TabBarView` | `TabBar(tabs: [...], controller: _tabController)` |

---

## CSS → Flutter Styling

### Colors
```dart
// HTML: style="color: #2563EB"
Text('Hello', style: TextStyle(color: Color(0xFF2563EB)))

// HTML: style="background-color: white"
Container(color: Colors.white, child: ...)

// Using theme colors
Text('Hello', style: TextStyle(color: Theme.of(context).primaryColor))
```

### Spacing
```dart
// HTML: margin: 16px
Padding(padding: EdgeInsets.all(16), child: ...)

// HTML: margin: 16px 8px
Padding(padding: EdgeInsets.symmetric(vertical: 16, horizontal: 8), child: ...)

// HTML: padding: 20px
Container(padding: EdgeInsets.all(20), child: ...)
```

### Typography
```dart
// HTML: font-size: 24px; font-weight: bold
Text('Title', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold))

// HTML: text-align: center
Text('Center', textAlign: TextAlign.center)

// HTML: text-overflow: ellipsis
Text('Long text', overflow: TextOverflow.ellipsis)
```

### Borders & Shapes
```dart
// HTML: border: 1px solid #ccc
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.grey, width: 1)
  ),
  child: ...
)

// HTML: border-radius: 8px
Container(
  decoration: BoxDecoration(borderRadius: BorderRadius.circular(8)),
  child: ...
)

// Rounded corners
ClipRRect(
  borderRadius: BorderRadius.circular(8),
  child: Image.network('url')
)
```

### Shadows
```dart
// HTML: box-shadow: 0 2px 8px rgba(0,0,0,0.1)
Container(
  decoration: BoxDecoration(
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.1),
        blurRadius: 8,
        offset: const Offset(0, 2),
      )
    ]
  ),
  child: ...
)
```

### Gradients
```dart
// HTML: background: linear-gradient(...)
Container(
  decoration: BoxDecoration(
    gradient: LinearGradient(
      colors: [Colors.blue, Colors.purple],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    )
  ),
  child: ...
)
```

### Opacity
```dart
// HTML: opacity: 0.5
Opacity(opacity: 0.5, child: Widget())

// or

Container(color: Colors.black.withOpacity(0.5))
```

---

## JavaScript → Dart Conversions

### Event Handling
```javascript
// HTML Button with onclick
<button onclick="handleClick()">Click</button>

// Dart/Flutter equivalent
ElevatedButton(
  onPressed: () => handleClick(),
  child: Text('Click'),
)
```

### DOM Manipulation
```javascript
// JavaScript: document.getElementById('email').value
// Dart: Use TextEditingController

TextEditingController emailController = TextEditingController();

TextField(
  controller: emailController,
  decoration: InputDecoration(hintText: 'Email'),
)

// Get value
String email = emailController.text;
```

### Form Validation
```javascript
// JavaScript/HTML form validation
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Dart equivalent
bool validateEmail(String email) {
  return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email);
}

// In Flutter TextField
TextFormField(
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(value)) {
      return 'Invalid email';
    }
    return null;
  },
)
```

### AsyncAwait
```javascript
// JavaScript
async function getItems() {
  const response = await fetch('/api/items');
  const data = await response.json();
  return data;
}

// Dart
Future<List<Item>> getItems() async {
  final response = await http.get(Uri.parse('/api/items'));
  final data = jsonDecode(response.body);
  return data;
}

// Dart with error handling
Future<List<Item>> getItems() async {
  try {
    final response = await http.get(Uri.parse('/api/items'));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List.from(data['items']).map((item) => Item.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load items');
    }
  } catch (e) {
    print('Error: $e');
    rethrow;
  }
}
```

### State Management
```javascript
// JavaScript: Using let/var for state
let items = [];
let currentUser = null;

function updateItems(newItems) {
  items = newItems;
  updateUI();
}

// Dart/Flutter: Using GetX
class ItemProvider extends GetxController {
  final items = <Item>[].obs;
  final currentUser = Rx<User?>(null);
  
  void updateItems(List<Item> newItems) {
    items.value = newItems;
    // UI automatically updates with Obx()
  }
}
```

### Array/List Operations
```javascript
// JavaScript
const filtered = items.filter(item => item.status === 'active');
const mapped = items.map(item => item.title);
const sorted = items.sort((a, b) => a.title > b.title);

// Dart
final filtered = items.where((item) => item.status == 'active').toList();
final mapped = items.map((item) => item.title).toList();
final sorted = List.from(items)..sort((a, b) => a.title.compareTo(b.title));
```

---

## Your Web Files → Flutter Screens Mapping

### `index.html` → `home_screen.dart`
```dart
// What you had in HTML
<div class="container">
  <h1>Dashboard</h1>
  <div class="recent-items">
    // Item cards
  </div>
</div>

// Flutter equivalent
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Dashboard')),
      body: Column(
        children: [
          Text('Dashboard', style: Theme.of(context).textTheme.headlineLarge),
          RecentItemsList(),
        ],
      ),
    );
  }
}
```

### `login.html` → `login_screen.dart`
```dart
// Form fields, submit button
// Use TextFormField instead of input
// Use ElevatedButton instead of button
// Validation using FormState
```

### `register.html` → `register_screen.dart`
```dart
// Multi-step form
// Password strength indicator
// Email verification flow
```

### `browse-found.html` → `browse_items_screen.dart`
```dart
// ListView with pagination
// Filter/search functionality
// Use ItemCard widget for each item
```

### `report-lost.html` / `report-found.html` → `report_item_screen.dart`
```dart
// Form with multiple fields
// Image picker integration
// Date picker for lost date
// Location details
```

### `my-claims.html` → `my_claims_screen.dart`
```dart
// ListView of claims
// Status badges
// Filter by status
```

### `profile.html` → `profile_screen.dart`
```dart
// User info display
// Edit profile form
// Tabs for items and claims
```

---

## API Integration Examples

### Before (JavaScript Fetch)
```javascript
// From your public/javascripts/api.js
async function loginUser(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  } else {
    throw new Error('Login failed');
  }
}
```

### After (Dart/Flutter with Dio)
```dart
// lib/services/api_service.dart
Future<Response> login(String email, String password) async {
  try {
    return await _dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
  } on DioException catch (e) {
    throw Exception('Login failed: ${e.message}');
  }
}
```

---

## Styling Examples - Web to Flutter

### Navigation Bar
**HTML:**
```html
<nav class="navbar">
  <a href="/home">Home</a>
  <a href="/browse">Browse</a>
  <a href="/profile">Profile</a>
</nav>
```

**Flutter:**
```dart
BottomNavigationBar(
  items: [
    BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
    BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Browse'),
    BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
  ],
  onTap: (index) => _navigateTo(index),
)
```

### Item Card
**HTML:**
```html
<div class="item-card">
  <img src="item.jpg" alt="Item">
  <h3>Item Title</h3>
  <p>Description</p>
  <span class="badge">Lost</span>
</div>
```

**Flutter:**
```dart
Card(
  child: Column(
    children: [
      CachedNetworkImage(imageUrl: 'item.jpg'),
      Text('Item Title', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      Text('Description'),
      Chip(label: Text('Lost')),
    ],
  ),
)
```

### Form Input
**HTML:**
```html
<form>
  <input type="email" placeholder="Email" id="email" class="form-input">
  <input type="password" placeholder="Password" id="password" class="form-input">
  <button type="submit" class="btn-primary">Login</button>
</form>
```

**Flutter:**
```dart
Form(
  key: _formKey,
  child: Column(
    children: [
      TextFormField(
        decoration: InputDecoration(
          hintText: 'Email',
          prefixIcon: Icon(Icons.email),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
        validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
      ),
      SizedBox(height: 16),
      TextFormField(
        obscureText: true,
        decoration: InputDecoration(
          hintText: 'Password',
          prefixIcon: Icon(Icons.lock),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
        validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
      ),
      SizedBox(height: 24),
      ElevatedButton(
        onPressed: () {
          if (_formKey.currentState!.validate()) {
            _handleLogin();
          }
        },
        child: Text('Login'),
      ),
    ],
  ),
)
```

---

## Common Patterns

### Modal/Dialog
**HTML:**
```html
<div class="modal" id="filterModal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Filter Items</h2>
    <!-- Filter options -->
  </div>
</div>
```

**Flutter:**
```dart
showDialog(
  context: context,
  builder: (context) => AlertDialog(
    title: Text('Filter Items'),
    content: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        DropdownButton(
          items: categories.map((cat) => DropdownMenuItem(
            value: cat,
            child: Text(cat),
          )).toList(),
          onChanged: (value) {},
        ),
      ],
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: Text('Close'),
      ),
    ],
  ),
)
```

### Loading Spinner
**HTML:**
```html
<div class="spinner"></div>
```

**Flutter:**
```dart
// Inline
if (isLoading) {
  CircularProgressIndicator()
} else {
  // Content
}

// Or with setState
Obx(() => itemProvider.isLoading.value
  ? CircularProgressIndicator()
  : ItemsList())
```

### Toast/Snackbar
**HTML (JavaScript):**
```javascript
toastr.success('Item added successfully');
```

**Flutter:**
```dart
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(
    content: Text('Item added successfully'),
    duration: Duration(seconds: 2),
  ),
)
```

### Image Gallery
**HTML:**
```html
<div class="image-gallery">
  <img src="img1.jpg" onclick="showImage(0)">
  <img src="img2.jpg" onclick="showImage(1)">
</div>
```

**Flutter:**
```dart
PageView(
  children: images.map((img) => Image.network(img)).toList(),
)

// Or with smooth scroll
GestureDetector(
  onPanUpdate: (details) => _handleSwipe(details),
  child: Image.network(images[currentIndex]),
)
```

---

## Performance Optimization - Web vs Flutter

### Image Loading
**Web (old):**
```html
<img src="/uploads/item.jpg" alt="Item">
```

**Flutter (optimized):**
```dart
CachedNetworkImage(
  imageUrl: 'https://api.example.com/uploads/item.jpg',
  placeholder: (context, url) => Shimmer.fromColors(
    baseColor: Colors.grey[300]!,
    highlightColor: Colors.grey[100]!,
    child: Container(color: Colors.white),
  ),
  errorWidget: (context, url, error) => Icon(Icons.error),
  cacheManager: CacheManager(
    Config(
      'itemImages',
      stalePeriod: Duration(days: 30),
      maxNrOfCacheObjects: 100,
    ),
  ),
)
```

### List Loading
**Web (old):**
```javascript
// Load everything at once
fetch('/api/items').then(res => res.json()).then(data => {
  items = data.items;
  renderAll();
});
```

**Flutter (optimized):**
```dart
// Pagination with GetX
class ItemProvider extends GetxController {
  void loadMore() {
    if (hasMoreItems.value) {
      getItems(page: currentPage.value + 1);
    }
  }
}

// In ListView
ListView.builder(
  controller: _scrollController,
  itemCount: items.length + 1,
  itemBuilder: (context, index) {
    if (index == items.length) {
      return isLoading.value ? LoadingIndicator() : SizedBox.shrink();
    }
    return ItemCard(item: items[index]);
  },
)
```

---

## Testing Equivalents

### JavaScript Test (old)
```javascript
// test_api.js
fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({email: 'test@example.com', password: 'password'}),
})
```

### Flutter Test (new)
```dart
// test/services/auth_service_test.dart
test('Login returns user on success', () async {
  // Mock HTTP response
  final mockHttpClient = MockHttpClient();
  when(mockHttpClient.post(...)).thenAnswer((_) async => Response('...', 200));
  
  final authService = AuthService(httpClient: mockHttpClient);
  final user = await authService.login('test@example.com', 'password');
  
  expect(user.email, 'test@example.com');
});
```

---

## Debugging Tips

### VS Code Flutter Debugging
1. Set breakpoints in Dart code
2. Run: `flutter run`
3. Press 'D' in terminal to open DevTools

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `setState called after dispose` | Widget disposed while async op running | Use `mounted` check or cancel operations in dispose |
| `Null safety error` | Null value passed | Use `?` for nullable types or `!` to assert non-null |
| `RenderFlex overflow` | Widget too large for space | Use `Expanded`, `Flexible`, or reduce size |
| `API connection refused` | Wrong API URL | Update baseUrl to correct IP/domain |
| `Image not loading` | Invalid URL or permissions | Check URL, add file permissions |

---

## Cheat Sheet Commands

```bash
# Create new screen
flutter create lib/screens/new_screen.dart

# Format code
dart format lib/

# Analyze code
flutter analyze

# Run tests
flutter test

# Build release
flutter build apk --release
flutter build ios --release

# Clean build
flutter clean && flutter pub get && flutter run
```

---

**Quick Tip**: Most of your backend code logic stays exactly the same. The main changes are:
1. Replace HTML with Flutter widgets
2. Replace JavaScript fetch with Dio/HTTP
3. Replace localStorage with SharedPreferences/SecureStorage
4. Replace DOM manipulation with Flutter state management (GetX/Provider)

---

**Last Updated**: February 13, 2026
