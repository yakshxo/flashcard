import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    User, 
    Camera, 
    Mail, 
    Phone, 
    School, 
    Calendar,
    Edit3, 
    Save, 
    X, 
    Trash2
} from 'lucide-react';
import OTPVerification from './OTPVerification';

const ProfileManagement = ({ user, onUpdate }) => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        profileImage: null,
        birthDate: '',
        schoolName: '',
        phoneNumber: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [showEmailChange, setShowEmailChange] = useState(false);
    const [emailChangeData, setEmailChangeData] = useState({
        newEmail: '',
        currentPassword: '',
        tempEmail: '',
        showOTP: false
    });
    
    const fileInputRef = useRef();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/api/profile');
            if (response.data.success) {
                const userData = response.data.data;
                setProfile({
                    name: userData.name,
                    email: userData.email,
                    profileImage: userData.profileImage,
                    birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : '',
                    schoolName: userData.schoolName || '',
                    phoneNumber: userData.phoneNumber || ''
                });
                if (userData.profileImage) {
                    setImagePreview(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${userData.profileImage}`);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        }
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
            
            handleImageUpload(file);
        }
    };

    const handleImageUpload = async (file) => {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await axios.post('/api/profile/upload-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                toast.success('Profile picture updated!');
                setProfile(prev => ({
                    ...prev,
                    profileImage: response.data.data.profileImage
                }));
                onUpdate({
                    ...user,
                    profileImage: response.data.data.profileImage
                });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error(error.response?.data?.message || 'Failed to upload image');
            setImagePreview(profile.profileImage ? `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${profile.profileImage}` : null);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = async () => {
        try {
            const response = await axios.delete('/api/profile/picture');
            if (response.data.success) {
                toast.success('Profile picture deleted');
                setProfile(prev => ({ ...prev, profileImage: null }));
                setImagePreview(null);
                onUpdate({
                    ...user,
                    profileImage: null
                });
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
        }
    };

    const handleProfileUpdate = async () => {
        setLoading(true);
        try {
            const response = await axios.put('/api/profile', {
                schoolName: profile.schoolName,
                phoneNumber: profile.phoneNumber
            });
            
            if (response.data.success) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                onUpdate({
                    ...user,
                    schoolName: profile.schoolName,
                    phoneNumber: profile.phoneNumber
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChangeRequest = async () => {
        if (!emailChangeData.newEmail || !emailChangeData.currentPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const response = await axios.post('/api/profile/request-email-change', {
                newEmail: emailChangeData.newEmail,
                currentPassword: emailChangeData.currentPassword
            });
            
            if (response.data.success) {
                setEmailChangeData(prev => ({
                    ...prev,
                    tempEmail: response.data.data.tempEmail,
                    showOTP: true
                }));
                toast.success('Verification code sent to your new email');
            }
        } catch (error) {
            console.error('Error requesting email change:', error);
            toast.error(error.response?.data?.message || 'Failed to request email change');
        }
    };

    const handleEmailChangeConfirm = async (data) => {
        try {
            const response = await axios.post('/api/profile/confirm-email-change', {
                newEmail: emailChangeData.tempEmail,
                otp: data.otp
            });
            
            if (response.data.success) {
                setProfile(prev => ({ ...prev, email: response.data.data.email }));
                setEmailChangeData({
                    newEmail: '',
                    currentPassword: '',
                    tempEmail: '',
                    showOTP: false
                });
                setShowEmailChange(false);
                onUpdate({
                    ...user,
                    email: response.data.data.email
                });
                toast.success('Email updated successfully!');
            }
        } catch (error) {
            console.error('Error confirming email change:', error);
            toast.error('Failed to update email');
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    };

    // Show OTP verification for email change
    if (emailChangeData.showOTP) {
        return (
            <OTPVerification
                email={emailChangeData.tempEmail}
                isLogin={false}
                onSuccess={(data) => handleEmailChangeConfirm(data)}
                onBack={() => setEmailChangeData(prev => ({ ...prev, showOTP: false }))}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Manage Profile
                        </h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                {imagePreview ? (
                                    <img 
                                        src={imagePreview} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    getInitials(profile.name)
                                )}
                            </div>
                            
                            {/* Upload/Delete buttons */}
                            <div className="absolute -bottom-2 -right-2 flex gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                                >
                                    {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <Camera className="h-4 w-4" />
                                    )}
                                </button>
                                
                                {profile.profileImage && (
                                    <button
                                        onClick={handleDeleteImage}
                                        className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-4 text-center">
                            Click the camera icon to upload a new profile picture<br />
                            Maximum file size: 5MB
                        </p>
                    </div>

                    {/* Profile Form */}
                    <div className="space-y-6">
                        {/* Name - Not editable */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                            <User className="h-5 w-5 text-gray-500 mr-3" />
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <p className="text-gray-900 font-medium">{profile.name}</p>
                                <p className="text-xs text-gray-500">Name cannot be changed</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                            <Mail className="h-5 w-5 text-gray-500 mr-3" />
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <p className="text-gray-900 font-medium">{profile.email}</p>
                                {!showEmailChange ? (
                                    <button
                                        onClick={() => setShowEmailChange(true)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                                    >
                                        Change Email
                                    </button>
                                ) : (
                                    <div className="mt-3 space-y-3">
                                        <input
                                            type="email"
                                            placeholder="New email address"
                                            value={emailChangeData.newEmail}
                                            onChange={(e) => setEmailChangeData(prev => ({
                                                ...prev,
                                                newEmail: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Current password"
                                            value={emailChangeData.currentPassword}
                                            onChange={(e) => setEmailChangeData(prev => ({
                                                ...prev,
                                                currentPassword: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleEmailChangeRequest}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Send Verification
                                            </button>
                                            <button
                                                onClick={() => setShowEmailChange(false)}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Birth Date - Not editable */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                            <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Birth Date
                                </label>
                                <p className="text-gray-900 font-medium">
                                    {profile.birthDate || 'Not set'}
                                </p>
                                <p className="text-xs text-gray-500">Birth date cannot be changed</p>
                            </div>
                        </div>

                        {/* School Name - Editable */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                            <School className="h-5 w-5 text-gray-500 mr-3" />
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    School/University
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.schoolName}
                                        onChange={(e) => setProfile(prev => ({
                                            ...prev,
                                            schoolName: e.target.value
                                        }))}
                                        placeholder="Enter your school or university name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">
                                        {profile.schoolName || 'Not set'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone Number - Editable */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                            <Phone className="h-5 w-5 text-gray-500 mr-3" />
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={profile.phoneNumber}
                                        onChange={(e) => setProfile(prev => ({
                                            ...prev,
                                            phoneNumber: e.target.value
                                        }))}
                                        placeholder="Enter your phone number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">
                                        {profile.phoneNumber || 'Not set'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    fetchProfile(); // Reset changes
                                }}
                                className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleProfileUpdate}
                                disabled={loading}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileManagement;