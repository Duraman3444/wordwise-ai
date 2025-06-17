import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { doc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { auth, db, isDemoMode } from '@/config/firebase'
import { UserPreferences } from '@/types'
import { 
  User, 
  Settings, 
  Bell, 
  Lock, 
  Save,
  Loader
} from 'lucide-react'

type TabType = 'profile' | 'writing' | 'notifications' | 'security'

export const Profile: React.FC = () => {
  const { user, login } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Profile Information State
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [nativeLanguage, setNativeLanguage] = useState('')
  const [englishLevel, setEnglishLevel] = useState('Intermediate')
  const [writingFocus, setWritingFocus] = useState('Academic Essays')
  
  // Writing Preferences State
  const [targetAudience, setTargetAudience] = useState(user?.preferences?.targetAudience || 'students')
  const [writingStyle, setWritingStyle] = useState(user?.preferences?.writingStyle || 'academic')
  const [grammarSuggestions, setGrammarSuggestions] = useState(user?.preferences?.suggestions?.grammar ?? true)
  const [styleSuggestions, setStyleSuggestions] = useState(user?.preferences?.suggestions?.style ?? true)
  const [vocabularySuggestions, setVocabularySuggestions] = useState(user?.preferences?.suggestions?.vocabulary ?? true)
  const [claritySuggestions, setClaritySuggestions] = useState(user?.preferences?.suggestions?.clarity ?? true)
  const [toneSuggestions, setToneSuggestions] = useState(user?.preferences?.suggestions?.tone ?? true)
  const [autoSave, setAutoSave] = useState(user?.preferences?.autoSave ?? true)
  
  // Notification Preferences State
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [suggestionAlerts, setSuggestionAlerts] = useState(true)
  
  // Privacy & Security State
  const [profileVisibility, setProfileVisibility] = useState('private')
  const [dataSharing, setDataSharing] = useState(false)
  const [analyticsTracking, setAnalyticsTracking] = useState(true)

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000)
  }

  const saveData = async (section: string, data: any) => {
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      let updatedPreferences: UserPreferences

      if (section === 'profile') {
        updatedPreferences = {
          ...user.preferences,
          eslPreferences: {
            nativeLanguage,
            englishLevel,
            writingFocus,
          }
        } as UserPreferences & { eslPreferences?: any }
      } else if (section === 'writing') {
        updatedPreferences = {
          ...user.preferences,
          targetAudience: targetAudience as 'students' | 'professionals' | 'creators',
          writingStyle: writingStyle as 'academic' | 'business' | 'casual' | 'creative',
          suggestions: {
            grammar: grammarSuggestions,
            style: styleSuggestions,
            vocabulary: vocabularySuggestions,
            clarity: claritySuggestions,
            tone: toneSuggestions,
          },
          autoSave,
        }
      } else {
        updatedPreferences = {
          ...user.preferences,
          notifications: {
            email: emailNotifications,
            push: pushNotifications,
            weeklyReports,
            suggestionAlerts,
          },
          privacy: {
            profileVisibility,
            dataSharing,
            analyticsTracking,
          }
        } as UserPreferences & { notifications?: any; privacy?: any }
      }

      if (isDemoMode) {
        const updatedUser = {
          ...user,
          name: section === 'profile' ? name : user.name,
          preferences: updatedPreferences,
          updatedAt: new Date(),
        }
        
        // Save to localStorage for persistence
        const currentProfile = JSON.parse(localStorage.getItem('demo-user-profile') || '{}')
        localStorage.setItem('demo-user-profile', JSON.stringify({
          ...currentProfile,
          name: section === 'profile' ? name : currentProfile.name || user.name,
          preferences: updatedPreferences,
          ...(section === 'profile' && { eslPreferences: { nativeLanguage, englishLevel, writingFocus } })
        }))
        
        login(updatedUser)
        setMessage({ type: 'success', text: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully!` })
        clearMessage()
      } else {
        // For Firebase mode
        const updateData: any = {
          preferences: updatedPreferences,
          updatedAt: new Date(),
        }

        if (section === 'profile') {
          // Update Firebase Auth profile if name changed
          if (auth.currentUser && name !== user.name) {
            await updateProfile(auth.currentUser, { displayName: name })
          }
          updateData.name = name
        }

        // Update Firestore document
        const userDocRef = doc(db, 'users', user.id)
        await updateDoc(userDocRef, updateData)

        // Update the auth store with new data
        const updatedUser = {
          ...user,
          name: section === 'profile' ? name : user.name,
          preferences: updatedPreferences,
          updatedAt: new Date(),
        }
        
        login(updatedUser)
        setMessage({ type: 'success', text: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully!` })
        clearMessage()
      }
    } catch (error: any) {
      console.error(`Error saving ${section}:`, error)
      let errorMessage = `Failed to update ${section} settings. Please try again.`
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please try logging out and back in.'
      } else if (error.code === 'network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setMessage({ type: 'error', text: errorMessage })
      clearMessage()
    } finally {
      setLoading(false)
    }
  }

  // Load saved preferences on component mount
  React.useEffect(() => {
    if (isDemoMode) {
      const savedProfile = localStorage.getItem('demo-user-profile')
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile)
          if (profile.eslPreferences) {
            setNativeLanguage(profile.eslPreferences.nativeLanguage || '')
            setEnglishLevel(profile.eslPreferences.englishLevel || 'Intermediate')
            setWritingFocus(profile.eslPreferences.writingFocus || 'Academic Essays')
          }
        } catch (error) {
          console.log('Failed to load preferences')
        }
      }
    }
  }, [])

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile Information', icon: User },
    { id: 'writing' as TabType, label: 'Writing Preferences', icon: Settings },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'security' as TabType, label: 'Privacy & Security', icon: Lock },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Change Picture
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={true}
                className="opacity-60"
              />
            </div>

            {/* ESL Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">ESL Learning Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Native Language
                  </label>
                  <select 
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select your native language</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Korean">Korean</option>
                    <option value="Japanese">Japanese</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Russian">Russian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    English Level
                  </label>
                  <select 
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Near Native">Near Native</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Writing Focus
                  </label>
                  <select 
                    value={writingFocus}
                    onChange={(e) => setWritingFocus(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Academic Essays">Academic Essays</option>
                    <option value="Business Communication">Business Communication</option>
                    <option value="Creative Writing">Creative Writing</option>
                    <option value="General Improvement">General Improvement</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => saveData('profile', {})} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case 'writing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Target Audience & Style</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <select 
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as 'students' | 'professionals' | 'creators')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="students">Students</option>
                    <option value="professionals">Professionals</option>
                    <option value="creators">Creators</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Writing Style
                  </label>
                  <select 
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value as 'academic' | 'business' | 'casual' | 'creative')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="academic">Academic</option>
                    <option value="business">Business</option>
                    <option value="casual">Casual</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Suggestion Types</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={grammarSuggestions}
                    onChange={(e) => setGrammarSuggestions(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Grammar & Spelling Corrections
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={styleSuggestions}
                    onChange={(e) => setStyleSuggestions(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Style & Flow Improvements
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={vocabularySuggestions}
                    onChange={(e) => setVocabularySuggestions(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Vocabulary Enhancement
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={claritySuggestions}
                    onChange={(e) => setClaritySuggestions(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Clarity & Readability
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={toneSuggestions}
                    onChange={(e) => setToneSuggestions(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Tone & Formality
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Document Settings</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Auto-save documents as you type
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => saveData('writing', {})} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Receive email notifications about account activity
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={weeklyReports}
                    onChange={(e) => setWeeklyReports(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Weekly writing progress reports
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">App Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Push notifications for new suggestions
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={suggestionAlerts}
                    onChange={(e) => setSuggestionAlerts(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Real-time alerts for important writing issues
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => saveData('notifications', {})} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Visibility
                  </label>
                  <select 
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dataSharing}
                    onChange={(e) => setDataSharing(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Allow anonymous data sharing to improve AI suggestions
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={analyticsTracking}
                    onChange={(e) => setAnalyticsTracking(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Allow analytics tracking for feature improvements
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Security</h3>
              <div className="space-y-4">
                <div>
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Change Password
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Last changed: Never
                  </p>
                </div>
                <div>
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900">
                    Delete Account
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Permanently delete your account and all data
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => saveData('security', {})} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your account settings and writing preferences.
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md border ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeTab === 'profile' && 'Update your personal information and account details.'}
                  {activeTab === 'writing' && 'Configure your writing preferences and AI assistance settings.'}
                  {activeTab === 'notifications' && 'Manage how you receive notifications from WordWise.'}
                  {activeTab === 'security' && 'Control your privacy settings and account security.'}
                </p>
              </div>

              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 