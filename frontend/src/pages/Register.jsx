import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Auth.module.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, checkEmailExists, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    panNumber: '',
    aadharNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [redirectMessage, setRedirectMessage] = useState('');

  // Check if redirected from login
  useEffect(() => {
    if (location.state?.fromLogin) {
      setRedirectMessage(location.state.message || 'Please create an account to continue.');
      setFormData(prev => ({ ...prev, email: location.state.email || '' }));
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh'
  ];

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.length < 2) return 'Minimum 2 characters required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only letters allowed';
        return '';
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only letters allowed';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[6-9]\d{9}$/.test(value)) return 'Invalid Indian mobile number';
        return '';
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required';
        const age = calculateAge(value);
        if (age < 18) return 'Must be at least 18 years old';
        if (age > 100) return 'Invalid date of birth';
        return '';
      case 'gender':
        if (!value) return 'Please select gender';
        return '';
      case 'panNumber':
        if (!value.trim()) return 'PAN number is required';
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) return 'Invalid PAN format (e.g., ABCDE1234F)';
        return '';
      case 'aadharNumber':
        if (!value.trim()) return 'Aadhar number is required';
        if (!/^\d{12}$/.test(value.replace(/\s/g, ''))) return 'Aadhar must be 12 digits';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.length < 10) return 'Please enter complete address';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        return '';
      case 'state':
        if (!value) return 'Please select state';
        return '';
      case 'pincode':
        if (!value.trim()) return 'Pincode is required';
        if (!/^\d{6}$/.test(value)) return 'Invalid pincode';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Minimum 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Include lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Include uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Include a number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Include special character (@$!%*?&)';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'agreeTerms':
        if (!value) return 'You must agree to terms';
        return '';
      default:
        return '';
    }
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    const error = validateField(name, newValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || ''
    };
  };

  const validateStep = (stepNumber) => {
    const stepFields = {
      1: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'],
      2: ['panNumber', 'aadharNumber', 'address', 'city', 'state', 'pincode'],
      3: ['password', 'confirmPassword', 'agreeTerms']
    };

    const newErrors = {};
    stepFields[stepNumber].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    // Check email exists on step 1
    if (step === 1) {
      if (checkEmailExists(formData.email)) {
        navigate('/login', {
          state: {
            fromRegister: true,
            email: formData.email
          }
        });
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateStep(3)) return;

  setIsLoading(true);
  setServerError('');

  try {
    // ✅ Convert firstName + lastName to fullName
    const registerData = {
      fullName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phoneNumber: formData.phone,
      password: formData.password,
      dateOfBirth: formData.dateOfBirth,
      address: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.pincode,
        country: 'India'
      }
    };

    await register(registerData);
    navigate('/dashboard', { replace: true });
  } catch (error) {
    setServerError(error.message || 'Registration failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const passwordStrength = getPasswordStrength();

  return (
    <div className={styles.authPage}>
      {/* Background */}
      <div className={styles.authBackground}>
        <div className={styles.bgGradient}></div>
        <div className={styles.bgPattern}></div>
        <div className={styles.bgShapes}>
          <div className={styles.shape1}></div>
          <div className={styles.shape2}></div>
          <div className={styles.shape3}></div>
        </div>
      </div>

      {/* Left Side - Branding */}
      <div className={styles.authBranding}>
        <Link to="/" className={styles.brandLogo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M4 16H36" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="12" cy="24" r="3" fill="currentColor"/>
              <path d="M20 22H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 26H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span>Bankify</span>
        </Link>
        
        <div className={styles.brandContent}>
          <h1>Create Your Account</h1>
          <p>Join millions of Indians who trust Bankify for their banking needs.</p>
          
          <div className={styles.brandBenefits}>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>✓</div>
              <span>Zero Balance Account</span>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>✓</div>
              <span>Free Virtual Debit Card</span>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>✓</div>
              <span>Instant Account Opening</span>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>✓</div>
              <span>₹50,000 Welcome Bonus</span>
            </div>
          </div>
        </div>

        <div className={styles.brandFooter}>
          <p>&copy; {new Date().getFullYear()} Bankify. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={styles.authFormContainer}>
        <div className={styles.authFormWrapper}>
          {/* Mobile Logo */}
          <Link to="/" className={styles.mobileLogo}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 40 40" fill="none">
                <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2.5"/>
                <path d="M4 16H36" stroke="currentColor" strokeWidth="2.5"/>
                <circle cx="12" cy="24" r="3" fill="currentColor"/>
              </svg>
            </div>
            <span>Bankify</span>
          </Link>

          {/* Progress Steps */}
          <div className={styles.progressSteps}>
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`${styles.progressStep} ${step >= s ? styles.active : ''} ${step > s ? styles.completed : ''}`}
              >
                <div className={styles.stepCircle}>
                  {step > s ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  ) : s}
                </div>
                <span className={styles.stepLabel}>
                  {s === 1 ? 'Personal' : s === 2 ? 'Identity' : 'Security'}
                </span>
              </div>
            ))}
            <div className={styles.progressLine}>
              <div className={styles.progressFill} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            </div>
          </div>

          <div className={styles.formHeader}>
            <h2>
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Identity Verification'}
              {step === 3 && 'Create Password'}
            </h2>
            <p>
              {step === 1 && 'Tell us about yourself'}
              {step === 2 && 'KYC details for account verification'}
              {step === 3 && 'Secure your account'}
            </p>
          </div>

          {/* Messages */}
          {redirectMessage && (
            <div className={styles.infoAlert}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>{redirectMessage}</span>
            </div>
          )}

          {serverError && (
            <div className={styles.errorAlert}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className={styles.formStep}>
                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${errors.firstName ? styles.hasError : ''}`}>
                    <label>First Name <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter first name"
                      />
                    </div>
                    {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${errors.lastName ? styles.hasError : ''}`}>
                    <label>Last Name <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter last name"
                      />
                    </div>
                    {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
                  </div>
                </div>

                <div className={`${styles.formGroup} ${errors.email ? styles.hasError : ''}`}>
                  <label>Email Address <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                <div className={`${styles.formGroup} ${errors.phone ? styles.hasError : ''}`}>
                  <label>Mobile Number <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputPrefix}>+91</div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </div>

                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${errors.dateOfBirth ? styles.hasError : ''}`}>
                    <label>Date of Birth <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                    </div>
                    {errors.dateOfBirth && <span className={styles.errorText}>{errors.dateOfBirth}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${errors.gender ? styles.hasError : ''}`}>
                    <label>Gender <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Identity */}
            {step === 2 && (
              <div className={styles.formStep}>
                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${errors.panNumber ? styles.hasError : ''}`}>
                    <label>PAN Number <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2"/>
                          <path d="M6 8h.01M6 12h.01M6 16h.01M10 8h8M10 12h8M10 16h8"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={(e) => handleChange({ target: { name: 'panNumber', value: e.target.value.toUpperCase() }})}
                        onBlur={handleBlur}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    {errors.panNumber && <span className={styles.errorText}>{errors.panNumber}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${errors.aadharNumber ? styles.hasError : ''}`}>
                    <label>Aadhar Number <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2"/>
                          <circle cx="8" cy="10" r="2"/>
                          <path d="M14 8h4M14 12h4"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="1234 5678 9012"
                        maxLength={14}
                      />
                    </div>
                    {errors.aadharNumber && <span className={styles.errorText}>{errors.aadharNumber}</span>}
                  </div>
                </div>

                <div className={`${styles.formGroup} ${errors.address ? styles.hasError : ''}`}>
                  <label>Address <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your complete address"
                      rows={3}
                    />
                  </div>
                  {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                </div>

                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${errors.city ? styles.hasError : ''}`}>
                    <label>City <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter city"
                      />
                    </div>
                    {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${errors.state ? styles.hasError : ''}`}>
                    <label>State <span className={styles.required}>*</span></label>
                    <div className={styles.inputWrapper}>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    {errors.state && <span className={styles.errorText}>{errors.state}</span>}
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.halfWidth} ${errors.pincode ? styles.hasError : ''}`}>
                  <label>Pincode <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter pincode"
                      maxLength={6}
                    />
                  </div>
                  {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <div className={styles.formStep}>
                <div className={`${styles.formGroup} ${errors.password ? styles.hasError : ''}`}>
                  <label>Create Password <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.password && (
                    <div className={styles.passwordStrength}>
                      <div className={styles.strengthBar}>
                        <div 
                          className={styles.strengthFill} 
                          style={{ width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }}
                        ></div>
                      </div>
                      <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                    </div>
                  )}
                  {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                  <div className={styles.passwordHints}>
                    <span className={formData.password.length >= 8 ? styles.valid : ''}>• 8+ characters</span>
                    <span className={/[A-Z]/.test(formData.password) ? styles.valid : ''}>• Uppercase</span>
                    <span className={/[a-z]/.test(formData.password) ? styles.valid : ''}>• Lowercase</span>
                    <span className={/\d/.test(formData.password) ? styles.valid : ''}>• Number</span>
                    <span className={/[@$!%*?&]/.test(formData.password) ? styles.valid : ''}>• Special char</span>
                  </div>
                </div>

                <div className={`${styles.formGroup} ${errors.confirmPassword ? styles.hasError : ''}`}>
                  <label>Confirm Password <span className={styles.required}>*</span></label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                </div>

                <div className={`${styles.formGroup} ${styles.checkboxGroup} ${errors.agreeTerms ? styles.hasError : ''}`}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                    />
                    <span className={styles.checkmark}></span>
                    <span>
                      I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a> <span className={styles.required}>*</span>
                    </span>
                  </label>
                  {errors.agreeTerms && <span className={styles.errorText}>{errors.agreeTerms}</span>}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className={styles.formActions}>
              {step > 1 && (
                <button type="button" className={styles.backBtn} onClick={handleBack}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12,19 5,12 12,5"/>
                  </svg>
                  <span>Back</span>
                </button>
              )}
              
              {step < 3 ? (
                <button type="button" className={styles.submitBtn} onClick={handleNext}>
                  <span>Continue</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                  </svg>
                </button>
              ) : (
                <button 
                  type="submit" 
                  className={`${styles.submitBtn} ${isLoading ? styles.loading : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className={styles.spinner}></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className={styles.authSwitch}>
            <p>
              Already have an account?
              <Link to="/login"> Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;