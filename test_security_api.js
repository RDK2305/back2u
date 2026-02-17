/**
 * CampusFind Security API Test Suite
 * Tests all new security-enhanced endpoints
 */

const API_URL = 'https://back2u-h67h.onrender.com//api/auth';

// Test 1: Check API is running
async function testAPIRunning() {
    console.log('\n🧪 Test 1: API Running Check');
    try {
        const response = await fetch('https://back2u-h67h.onrender.com//');
        const data = await response.json();
        console.log('✅ API Response:', data);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 2: Invalid student registration (missing fields)
async function testStudentRegistrationValidation() {
    console.log('\n🧪 Test 2: Student Registration Validation');
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: 'A00123456',
                email: 'test@conestogac.on.ca',
                first_name: 'Test',
                last_name: 'User',
                campus: 'Main',
                program: 'CS',
                password: 'WeakPass'  // Invalid password
            })
        });
        const data = await response.json();
        console.log(response.status === 400 ? '✅ Validation Failed as Expected' : '⚠️ Unexpected Response');
        console.log('Response:', data);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 3: Valid student registration
async function testStudentRegistrationSuccess() {
    console.log('\n🧪 Test 3: Valid Student Registration');
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: `A${Date.now()}`,
                email: `student${Date.now()}@conestogac.on.ca`,
                first_name: 'John',
                last_name: 'Doe',
                campus: 'Main',
                program: 'Computer Science',
                password: 'SecurePass123!'
            })
        });
        const data = await response.json();
        console.log(response.status === 201 ? '✅ Registration Successful' : '⚠️ Unexpected Status');
        console.log('Response:', data);
        return data.user ? data.user.id : null;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 4: Invalid email domain
async function testEmailDomainValidation() {
    console.log('\n🧪 Test 4: Email Domain Validation');
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: 'A00999999',
                email: 'test@gmail.com',  // Invalid domain
                first_name: 'John',
                last_name: 'Doe',
                campus: 'Main',
                program: 'CS',
                password: 'SecurePass123!'
            })
        });
        const data = await response.json();
        console.log(response.status === 400 ? '✅ Email Domain Rejected' : '⚠️ Unexpected Response');
        console.log('Response:', data);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 5: Invalid security code
async function testInvalidsecurityCode() {
    console.log('\n🧪 Test 5: Invalid security Registration Code');
    try {
        const response = await fetch(`${API_URL}/register-security`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: 'S00123456',
                email: 'security@conestogac.on.ca',
                first_name: 'Jane',
                last_name: 'Smith',
                program: 'security',
                password: 'SecurePass123!',
                securityCode: 'INVALID_CODE'  // Invalid code
            })
        });
        const data = await response.json();
        console.log(response.status === 403 ? '✅ Invalid Code Rejected' : '⚠️ Unexpected Response');
        console.log('Response:', data);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 6: Valid security registration with code
async function testValidsecurityRegistration() {
    console.log('\n🧪 Test 6: Valid security Registration with Code');
    try {
        const response = await fetch(`${API_URL}/register-security`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: `S${Date.now()}`,
                email: `security${Date.now()}@conestogac.on.ca`,
                first_name: 'Jane',
                last_name: 'Smith',
                program: 'security',
                password: 'SecurePass123!',
                securityCode: 'security2024SECURE'  // Valid code
            })
        });
        const data = await response.json();
        console.log(response.status === 201 ? '✅ security Registration Successful' : '⚠️ Unexpected Status');
        console.log('Response:', {
            message: data.message,
            role: data.user?.role,
            is_verified: data.user?.is_verified,
            hasToken: !!data.token
        });
        return data.token;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 7: Login without verification (should fail for student)
async function testLoginUnverified() {
    console.log('\n🧪 Test 7: Login Without Email Verification');
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@conestogac.on.ca',
                password: 'SecurePass123!'
            })
        });
        const data = await response.json();
        console.log(response.status === 403 ? '✅ Login Blocked (Not Verified)' : '⚠️ Unexpected Response');
        console.log('Response:', data);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 8: Invalid login credentials
async function testInvalidLogin() {
    console.log('\n🧪 Test 8: Invalid Login Credentials');
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'nonexistent@conestogac.on.ca',
                password: 'WrongPassword123!'
            })
        });
        const data = await response.json();
        console.log(response.status === 401 ? '✅ Invalid Credentials Rejected' : '⚠️ Unexpected Response');
        console.log('Response:', data);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 9: Rate limiting check (login)
async function testRateLimiting() {
    console.log('\n🧪 Test 9: Rate Limiting (Login Endpoint)');
    try {
        for (let i = 0; i < 7; i++) {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `test${i}@conestogac.on.ca`,
                    password: 'password'
                })
            });
            console.log(`Attempt ${i + 1}: Status ${response.status}`);
            if (response.status === 429 || (response.headers.get('RateLimit-Remaining') === '0')) {
                console.log('✅ Rate Limiting Activated');
                break;
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🔒 CampusFind Security API Tests Starting...');
    console.log('=' .repeat(50));
    
    await testAPIRunning();
    await testStudentRegistrationValidation();
    await testEmailDomainValidation();
    await testInvalidsecurityCode();
    await testValidsecurityRegistration();
    await testInvalidLogin();
    // await testRateLimiting();  // Comment out to avoid blocking
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All Tests Completed!');
}

// Run tests
runAllTests();
