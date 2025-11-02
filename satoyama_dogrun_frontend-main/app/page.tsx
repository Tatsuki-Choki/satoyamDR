"use client"

import { useState, type FormEvent, useCallback, useMemo, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"
import { MapPin, Bell, Home, MessageCircle, QrCode, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import { HomeSection } from "@/components/home-section"
import { EventsSection } from "@/components/events-section"
import { FeedSection } from "@/components/feed-section"
import { EntrySection } from "@/components/entry-section"
import { ProfileSection } from "@/components/profile-section"

// モーダルを遅延読み込み（パフォーマンス最適化）
const NoticesModal = dynamic(() => import("@/components/modals/notices-modal").then(mod => ({ default: mod.NoticesModal })), { ssr: false })
const CreatePostModal = dynamic(() => import("@/components/modals/create-post-modal").then(mod => ({ default: mod.CreatePostModal })), { ssr: false })
const CommentModal = dynamic(() => import("@/components/modals/comment-modal").then(mod => ({ default: mod.CommentModal })), { ssr: false })
const AddDogRegistrationModal = dynamic(() => import("@/components/modals/add-dog-registration-modal").then(mod => ({ default: mod.AddDogRegistrationModal })), { ssr: false })
const EditDogModal = dynamic(() => import("@/components/modals/edit-dog-modal").then(mod => ({ default: mod.EditDogModal })), { ssr: false })
const EditOwnerModal = dynamic(() => import("@/components/modals/edit-owner-modal").then(mod => ({ default: mod.EditOwnerModal })), { ssr: false })
const ApplicationStatusModal = dynamic(() => import("@/components/application-status-modal").then(mod => ({ default: mod.ApplicationStatusModal })), { ssr: false })

import { currentUsers, initialRecentPosts, initialNotices, initialOwnerProfile, notices, posts, upcomingEvents } from "@/lib/data"
import { registeredEmail, UserStatus, ActiveTab, NewDogRegistrationStatus, CalendarType } from "@/lib/constants"
import type { DogProfile, Post, Notice, OwnerProfile } from "@/lib/types"
import { RegisterRequest, userApiClient, ApplicationRequest } from "@/lib/api/user-api"

// Temporary owner profile for demo purposes
const tempInitialOwnerProfile: OwnerProfile = {
  fullName: "田中 太郎",
  address: "東京都渋谷区...", // This will be updated by new address fields
  email: "test@example.com",
  phoneNumber: "090-1234-5678",
  imabariResidency: "more_than_5_years", // Example value
  memberSince: "2年3ヶ月",
}

export default function DogrunsApp() {
  // Global States
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Home)
  const [userStatus, setUserStatus] = useState<UserStatus>(UserStatus.Initial)
  const [loginError, setLoginError] = useState<string>("")

  // Home Section States
  const [showTerms, setShowTerms] = useState<boolean>(false)
  const [userRegisteredEmail, setUserRegisteredEmail] = useState<string | null>(null) // State to store the registered email
  const [vaccinationCertificateFile, setVaccinationCertificateFile] = useState<File | null>(null)
  const [selectedImabariResidency, setSelectedImabariResidency] = useState<string>("")

  // For new address fields
  const [postalCode, setPostalCode] = useState("")
  const [prefecture, setPrefecture] = useState("")
  const [city, setCity] = useState("")
  const [street, setStreet] = useState("")
  const [building, setBuilding] = useState("")
  const [applicationDate, setApplicationDate] = useState("")

  // Events Section States
  const [activeCalendar, setActiveCalendar] = useState<CalendarType>(CalendarType.Dogrun)
  const [displayDate, setDisplayDate] = useState<Date>(new Date())

  // Feed Section States
  const [recentPosts, setRecentPosts] = useState<Post[]>(initialRecentPosts)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTag, setActiveTag] = useState<string>("all")
  const [showCreatePostModal, setShowCreatePostModal] = useState<boolean>(false)
  const [newPostCategory, setNewPostCategory] = useState<string>("")
  const [newPostContent, setNewPostContent] = useState<string>("")
  const [newPostHashtags, setNewPostHashtags] = useState<string>("")
  const [newPostImageFile, setNewPostImageFile] = useState<File | null>(null)
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false)
  const [selectedPostIdForComment, setSelectedPostIdForComment] = useState<number | null>(null)
  const [newCommentText, setNewCommentText] = useState<string>("")

  // Entry Section States
  const [entryStep, setEntryStep] = useState<string>("initial") // "initial", "scanning", "dog_selection", "entry_complete"
  const [selectedDogsForEntry, setSelectedDogsForEntry] = useState<number[]>([])
  const [isInDogRun, setIsInDogRun] = useState<boolean>(false)

  // Profile Section States
  const [loggedInUserDogs, setLoggedInUserDogs] = useState<DogProfile[]>(
    currentUsers.filter((user) => user.owner === "田中さん"),
  ) // Assuming "田中さん" is the logged-in user
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(tempInitialOwnerProfile)

  // Modals States
  const [showNoticesModal, setShowNoticesModal] = useState<boolean>(false)
  const [currentNotices, setCurrentNotices] = useState<Notice[]>(initialNotices)

  // Add Dog Modal States
  const [showAddDogModal, setShowAddDogModal] = useState<boolean>(false)
  const [newDogRegistrationStatus, setNewDogRegistrationStatus] = useState<NewDogRegistrationStatus>(
    NewDogRegistrationStatus.Initial,
  )
  const [newDogName, setNewDogName] = useState<string>("")
  const [newDogBreed, setNewDogBreed] = useState<string>("")
  const [newDogWeight, setNewDogWeight] = useState<string>("")
  const [newDogPersonality, setNewDogPersonality] = useState<string[]>([])
  const [newDogLastVaccinationDate, setNewDogLastVaccinationDate] = useState<string>("")
  const [newDogVaccinationCertificateFile, setNewDogVaccinationCertificateFile] = useState<File | null>(null)

  // Edit Dog Modal States
  const [editingDogId, setEditingDogId] = useState<number | null>(null)
  const [editedDogName, setEditedDogName] = useState<string>("")
  const [editedDogBreed, setEditedDogBreed] = useState<string>("")
  const [editedDogWeight, setEditedDogWeight] = useState<string>("")
  const [editedDogPersonality, setEditedDogPersonality] = useState<string[]>([])

  // Edit Owner Modal States
  const [showEditOwnerModal, setShowEditOwnerModal] = useState<boolean>(false)
  const [showApplicationStatusModal, setShowApplicationStatusModal] = useState<boolean>(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [editedOwnerFullName, setEditedOwnerFullName] = useState<string>(ownerProfile.fullName)
  const [editedOwnerAddress, setEditedOwnerAddress] = useState<string>(ownerProfile.address)
  const [editedOwnerEmail, setEditedOwnerEmail] = useState<string>(ownerProfile.email)
  const [editedOwnerPhoneNumber, setEditedOwnerPhoneNumber] = useState<string>(ownerProfile.phoneNumber)
  const [editedOwnerImabariResidency, setEditedOwnerImabariResidency] = useState<string>(ownerProfile.imabariResidency)

  // Memoized unread notices count
  const unreadNoticesCount = useMemo(() => currentNotices.filter((notice) => !notice.read).length, [currentNotices])

  // --- Handlers ---

  const handleRegistrationSubmit = useCallback(
    async (
      formData: FormData
    ) => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log("申請データ送信中:", formData)
        }
        const response = await userApiClient.applyRegistration(formData)
        if (process.env.NODE_ENV === 'development') {
          console.log("API呼び出し成功:", response)
        }

        localStorage.setItem('application_id', response.application_id)
        
        // emailをFormDataから取得してセット
        const email = formData.get('email') as string;
        setUserRegisteredEmail(email)
        setUserStatus(UserStatus.RegistrationPending)
        toast.success("利用申請が送信されました", {
          description: `申請ID: ${response.application_id}\n管理者の承認をお待ちください。`,
        })
      } catch (error: unknown) {
        const apiError = error as { response?: { data?: { detail?: string } } }
        if (process.env.NODE_ENV === 'development') {
          console.error("申請エラー:", error)
        }
        toast.error("申請の送信に失敗しました", {
          description: apiError.response?.data?.detail || "エラーが発生しました。もう一度お試しください。",
        })
      }
    },
    [setUserStatus, setUserRegisteredEmail],
  )

  const handleLoginSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const form = e.currentTarget as HTMLFormElement
      const email = (form.elements.namedItem("loginEmail") as HTMLInputElement).value
      const password = (form.elements.namedItem("loginPassword") as HTMLInputElement)?.value

      if (!password) {
        setLoginError("パスワードを入力してください。")
        return
      }

      try {
        const response = await userApiClient.login({ email, password })
        
        // トークンは userApiClient.login 内で自動的に localStorage に保存される
        setUserStatus(UserStatus.LoggedIn)
        setLoginError("")
        toast.success("ログインしました")
        
        // ユーザー情報を取得
        try {
          const userInfo = await userApiClient.getCurrentUser()
          if (process.env.NODE_ENV === 'development') {
            console.log("ログインユーザー情報:", userInfo)
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("ユーザー情報取得エラー:", error)
          }
        }
      } catch (error: unknown) {
        const apiError = error as { response?: { status?: number } }
        if (process.env.NODE_ENV === 'development') {
          console.error("ログインエラー:", error)
        }
        if (apiError.response?.status === 401) {
          setLoginError("メールアドレスまたはパスワードが正しくありません。")
        } else {
          setLoginError("ログインに失敗しました。もう一度お試しください。")
        }
      }
    },
    [setUserStatus, setLoginError],
  )

  const handleForgotPasswordSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      setUserStatus(UserStatus.ForgotPasswordSent)
    },
    [setUserStatus],
  )

  const handleLogout = useCallback(() => {
    userApiClient.logout() // localStorage からトークンを削除
    setUserStatus(UserStatus.Initial) // Change to UserStatus.Initial to simulate logout
    setActiveTab(ActiveTab.Home)
    toast.success("ログアウトしました")
  }, [setUserStatus, setActiveTab])

  const handleDemoLogin = useCallback(async () => {
    try {
      const response = await userApiClient.login({
        email: 'demo@example.com',
        password: 'demo123'
      })
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token)
        setUserStatus(UserStatus.LoggedIn)
        setLoginError("")
        toast.success("デモアカウントでログインしました")
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Demo login failed:", error)
      }
      toast.error("デモログインに失敗しました")
    }
  }, [setUserStatus, setLoginError])

  const handleCheckApplicationStatus = useCallback(() => {
    // ローカルストレージから申請IDを取得
    const storedApplicationId = localStorage.getItem('application_id')
    if (storedApplicationId) {
      setApplicationId(storedApplicationId)
      setShowApplicationStatusModal(true)
    } else {
      toast.error("申請IDが見つかりません")
    }
  }, [])

  const handlePreviousMonth = useCallback(() => {
    setDisplayDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }, [])

  const handleNextMonth = useCallback(() => {
    setDisplayDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }, [])

  const handleNewPostSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()

      if (!newPostCategory || !newPostContent) {
        alert("カテゴリーと投稿内容は必須です。")
        return
      }

      const newPost: Post = {
        id: Date.now(),
        user: "あなた",
        dog: "あなたの愛犬",
        content: newPostContent + (newPostHashtags ? " " + newPostHashtags : ""),
        image: !!newPostImageFile,
        likes: 0,
        comments: 0,
        time: "たった今",
        tag: newPostCategory,
        isLiked: false,
        commentsList: [],
      }

      setRecentPosts((prevPosts) => [newPost, ...prevPosts])

      setNewPostCategory("")
      setNewPostContent("")
      setNewPostHashtags("")
      setNewPostImageFile(null)
      setShowCreatePostModal(false)
    },
    [newPostCategory, newPostContent, newPostHashtags, newPostImageFile, setRecentPosts],
  )

  const handleAddComment = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (!newCommentText.trim() || selectedPostIdForComment === null) {
        return
      }

      setRecentPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPostIdForComment
            ? {
                ...post,
                comments: post.comments + 1,
                commentsList: [...post.commentsList, { id: Date.now(), user: "あなた", text: newCommentText.trim() }],
              }
            : post,
        ),
      )

      setNewCommentText("")
      setShowCommentModal(false)
      setSelectedPostIdForComment(null)
    },
    [newCommentText, selectedPostIdForComment, setRecentPosts],
  )

  const handleAddDogRegistrationSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()

      if (!newDogVaccinationCertificateFile) {
        alert("ワクチンの接種証明書を添付してください。")
        return
      }

      const newDog: DogProfile = {
        id: Date.now(),
        name: newDogName,
        breed: newDogBreed,
        weight: `${parseFloat(newDogWeight)}kg`,
        owner: ownerProfile.fullName, // Assign current logged-in owner
        time: "たった今",
        personality: newDogPersonality,
        lastVaccinationDate: newDogLastVaccinationDate,
      }

      setLoggedInUserDogs((prevDogs) => [...prevDogs, newDog])
      setNewDogRegistrationStatus(NewDogRegistrationStatus.Pending)
      toast.success("愛犬の登録申請が送信されました", {
        description: "管理者の承認をお待ちください。",
      })
    },
    [newDogName, newDogBreed, newDogWeight, newDogPersonality, newDogLastVaccinationDate, newDogVaccinationCertificateFile, ownerProfile.fullName],
  )

  const handleApproveNewDog = useCallback(
    (dogId: number) => {
      setLoggedInUserDogs((prevDogs) =>
        prevDogs.map((dog) => (dog.id === dogId ? { ...dog, approved: true } : dog)),
      )
      toast.success("愛犬の登録が承認されました", {
        description: "愛犬の情報がプロフィールに追加されました。",
      })
    },
    [],
  )

  const handleEditDog = useCallback(
    (dogId: number) => {
      const dogToEdit = loggedInUserDogs.find((dog) => dog.id === dogId)
      if (dogToEdit) {
        setEditingDogId(dogId)
        setEditedDogName(dogToEdit.name)
        setEditedDogBreed(dogToEdit.breed)
        setEditedDogWeight(dogToEdit.weight.replace("kg", ""))
        setEditedDogPersonality(dogToEdit.personality || [])
      }
    },
    [loggedInUserDogs],
  )

  const handleSaveDogEdit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (editingDogId === null) return

      setLoggedInUserDogs((prevDogs) =>
        prevDogs.map((dog) =>
          dog.id === editingDogId
            ? {
                ...dog,
                name: editedDogName,
                breed: editedDogBreed,
                weight: `${editedDogWeight}kg`,
                personality: editedDogPersonality,
              }
            : dog,
        ),
      )
      setEditingDogId(null)
      setEditedDogName("")
      setEditedDogBreed("")
      setEditedDogWeight("")
      setEditedDogPersonality([])
    },
    [editingDogId, editedDogName, editedDogBreed, editedDogWeight, editedDogPersonality, setLoggedInUserDogs],
  )

  const handleCancelDogEdit = useCallback(() => {
    setEditingDogId(null)
    setEditedDogName("")
    setEditedDogBreed("")
    setEditedDogWeight("")
    setEditedDogPersonality([])
  }, [])

  const handleSaveOwnerEdit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      setOwnerProfile({
        ...ownerProfile,
        fullName: editedOwnerFullName,
        address: editedOwnerAddress,
        email: editedOwnerEmail,
        phoneNumber: editedOwnerPhoneNumber,
        imabariResidency: editedOwnerImabariResidency,
      })
      setShowEditOwnerModal(false)
    },
    [
      ownerProfile,
      editedOwnerFullName,
      editedOwnerAddress,
      editedOwnerEmail,
      editedOwnerPhoneNumber,
      editedOwnerImabariResidency,
      setOwnerProfile,
      setShowEditOwnerModal,
    ],
  )

  const handleCancelOwnerEdit = useCallback(() => {
    setShowEditOwnerModal(false)
    setEditedOwnerFullName(ownerProfile.fullName)
    setEditedOwnerAddress(ownerProfile.address)
    setEditedOwnerEmail(ownerProfile.email)
    setEditedOwnerPhoneNumber(ownerProfile.phoneNumber)
    setEditedOwnerImabariResidency(ownerProfile.imabariResidency)
  }, [ownerProfile, setShowEditOwnerModal])

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl">
      {/* Header - アシックス里山スタジアムスタイル */}
      <div className="relative bg-gradient-to-r from-asics-satoyama-blue to-asics-satoyama-blue-700 text-white px-4 py-5 sticky top-0 z-10 shadow-xl overflow-hidden">
        {/* 波形デザイン */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
            <path
              d="M0,40 Q100,20 200,40 T400,40 L400,80 L0,80 Z"
              fill="currentColor"
              className="text-fc-imabari-yellow"
            />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-asics-satoyama-green/30 p-2.5 rounded-full">
              <MapPin className="h-6 w-6 text-asics-satoyama-green" />
            </div>
            <h1 className="text-2xl font-heading font-bold">里山ドッグラン</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                userStatus === UserStatus.LoggedIn 
                  ? "bg-asics-satoyama-gold text-white font-bold" 
                  : "bg-white/20 text-white border border-white/30"
              }`}
            >
              {userStatus === UserStatus.LoggedIn ? "ログイン中" : "ログアウト中"}
            </span>
            {userStatus === UserStatus.LoggedIn && (
              <>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNoticesModal(true)}
                    className="text-white hover:text-asics-satoyama-green hover:bg-white/10 rounded-full transition-all"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">お知らせ</span>
                  </Button>
                  {unreadNoticesCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-asics-satoyama-gold rounded-full animate-pulse">
                      {unreadNoticesCount}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-20 relative z-0">
        {activeTab === ActiveTab.Home && (
          <HomeSection
            userStatus={userStatus}
            setUserStatus={setUserStatus}
            showTerms={showTerms}
            setShowTerms={setShowTerms}
            loginError={loginError}
            setLoginError={setLoginError}
            vaccinationCertificateFile={vaccinationCertificateFile}
            setVaccinationCertificateFile={setVaccinationCertificateFile}
            selectedImabariResidency={selectedImabariResidency}
            setSelectedImabariResidency={setSelectedImabariResidency}
            handleRegistrationSubmit={handleRegistrationSubmit}
            handleLoginSubmit={handleLoginSubmit}
            handleForgotPasswordSubmit={handleForgotPasswordSubmit}
            handleDemoLogin={handleDemoLogin}
            handleLogout={handleLogout}
            onCheckApplicationStatus={handleCheckApplicationStatus}
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            prefecture={prefecture}
            setPrefecture={setPrefecture}
            city={city}
            setCity={setCity}
            street={street}
            setStreet={setStreet}
            building={building}
            setBuilding={setBuilding}
            applicationDate={applicationDate}
            setApplicationDate={setApplicationDate}
          />
        )}
        {activeTab === ActiveTab.Events && (
          <EventsSection
            userStatus={userStatus}
            activeCalendar={activeCalendar}
            setActiveCalendar={setActiveCalendar}
            displayDate={displayDate}
            handlePreviousMonth={handlePreviousMonth}
            handleNextMonth={handleNextMonth}
          />
        )}
        {activeTab === ActiveTab.Feed && userStatus === UserStatus.LoggedIn && (
          <FeedSection
            userStatus={userStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTag={activeTag}
            setActiveTag={setActiveTag}
            recentPosts={recentPosts}
            setRecentPosts={setRecentPosts}
            setShowCreatePostModal={setShowCreatePostModal}
            setSelectedPostIdForComment={setSelectedPostIdForComment}
            setShowCommentModal={setShowCommentModal}
          />
        )}
        {activeTab === ActiveTab.Entry && userStatus === UserStatus.LoggedIn && (
          <EntrySection
            userStatus={userStatus}
            entryStep={entryStep}
            setEntryStep={setEntryStep}
            loggedInUserDogs={loggedInUserDogs}
            selectedDogsForEntry={selectedDogsForEntry}
            setSelectedDogsForEntry={setSelectedDogsForEntry}
            isInDogRun={isInDogRun}
            setIsInDogRun={setIsInDogRun}
          />
        )}
        {activeTab === ActiveTab.Profile && userStatus === UserStatus.LoggedIn && (
          <ProfileSection
            userStatus={userStatus}
            loggedInUserDogs={loggedInUserDogs}
            setLoggedInUserDogs={setLoggedInUserDogs}
            setShowAddDogModal={setShowAddDogModal}
            handleEditDog={handleEditDog}
            handleLogout={handleLogout}
            ownerProfile={ownerProfile}
            setOwnerProfile={setOwnerProfile}
            setShowEditOwnerModal={setShowEditOwnerModal}
          />
        )}
        {activeTab !== ActiveTab.Home &&
          activeTab !== ActiveTab.Events &&
          userStatus !== UserStatus.LoggedIn &&
          userStatus !== UserStatus.Initial &&
          userStatus !== UserStatus.RegistrationForm &&
          userStatus !== UserStatus.RegistrationPending &&
          userStatus !== UserStatus.ApprovedNeedsLogin &&
          userStatus !== UserStatus.ForgotPasswordForm &&
          userStatus !== UserStatus.ForgotPasswordSent && (
            <div className="space-y-6 text-center">
              <div
                className="border-asics-blue-200"
                style={{ backgroundColor: "rgba(0, 8, 148, 0.05)", borderColor: "rgba(0, 8, 148, 0.2)" }}
              >
                <div className="p-6">
                  <h2 className="text-xl font-heading mb-4" style={{ color: "rgb(0, 8, 148)" }}>
                    この機能はログイン後に利用可能です
                  </h2>
                  <p className="text-sm text-gray-600 font-caption">
                    すべての機能をご利用いただくには、ログインが必要です。
                  </p>
                  <Button
                    onClick={() => setActiveTab(ActiveTab.Home)}
                    className="mt-6 text-white"
                    style={{ backgroundColor: "rgb(0, 8, 148)" }}
                  >
                    ホームに戻る
                  </Button>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Modals */}
      <NoticesModal
        showNoticesModal={showNoticesModal}
        setShowNoticesModal={setShowNoticesModal}
        notices={currentNotices}
        setNotices={setCurrentNotices}
      />
      <CreatePostModal
        showCreatePostModal={showCreatePostModal}
        setShowCreatePostModal={setShowCreatePostModal}
        newPostCategory={newPostCategory}
        setNewPostCategory={setNewPostCategory}
        newPostContent={newPostContent}
        setNewPostContent={setNewPostContent}
        newPostHashtags={newPostHashtags}
        setNewPostHashtags={setNewPostHashtags}
        newPostImageFile={newPostImageFile}
        setNewPostImageFile={setNewPostImageFile}
        handleNewPostSubmit={handleNewPostSubmit}
      />
      <CommentModal
        showCommentModal={showCommentModal}
        setShowCommentModal={setShowCommentModal}
        selectedPostIdForComment={selectedPostIdForComment}
        setSelectedPostIdForComment={setSelectedPostIdForComment}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        recentPosts={recentPosts}
        setRecentPosts={setRecentPosts}
        handleAddComment={handleAddComment}
      />
      <AddDogRegistrationModal
        showAddDogModal={showAddDogModal}
        setShowAddDogModal={setShowAddDogModal}
        newDogRegistrationStatus={newDogRegistrationStatus}
        setNewDogRegistrationStatus={setNewDogRegistrationStatus}
        newDogName={newDogName}
        setNewDogName={setNewDogName}
        newDogBreed={newDogBreed}
        setNewDogBreed={setNewDogBreed}
        newDogWeight={newDogWeight}
        setNewDogWeight={setNewDogWeight}
        newDogPersonality={newDogPersonality}
        setNewDogPersonality={setNewDogPersonality}
        newDogLastVaccinationDate={newDogLastVaccinationDate}
        setNewDogLastVaccinationDate={setNewDogLastVaccinationDate}
        newDogVaccinationCertificateFile={newDogVaccinationCertificateFile}
        setNewDogVaccinationCertificateFile={setNewDogVaccinationCertificateFile}
        setLoggedInUserDogs={setLoggedInUserDogs}
        handleAddDogRegistrationSubmit={handleAddDogRegistrationSubmit}
        handleApproveNewDog={handleApproveNewDog}
      />
      <EditDogModal
        editingDogId={editingDogId}
        setEditingDogId={setEditingDogId}
        editedDogName={editedDogName}
        setEditedDogName={setEditedDogName}
        editedDogBreed={editedDogBreed}
        setEditedDogBreed={setEditedDogBreed}
        editedDogWeight={editedDogWeight}
        setEditedDogWeight={setEditedDogWeight}
        editedDogPersonality={editedDogPersonality}
        setEditedDogPersonality={setEditedDogPersonality}
        loggedInUserDogs={loggedInUserDogs}
        setLoggedInUserDogs={setLoggedInUserDogs}
        handleSaveDogEdit={handleSaveDogEdit}
        handleCancelDogEdit={handleCancelDogEdit}
      />
      <EditOwnerModal
        showEditOwnerModal={showEditOwnerModal}
        setShowEditOwnerModal={setShowEditOwnerModal}
        ownerProfile={ownerProfile}
        setOwnerProfile={setOwnerProfile}
        editedOwnerFullName={editedOwnerFullName}
        setEditedOwnerFullName={setEditedOwnerFullName}
        editedOwnerAddress={editedOwnerAddress}
        setEditedOwnerAddress={setEditedOwnerAddress}
        editedOwnerEmail={editedOwnerEmail}
        setEditedOwnerEmail={setEditedOwnerEmail}
        editedOwnerPhoneNumber={editedOwnerPhoneNumber}
        setEditedOwnerPhoneNumber={setEditedOwnerPhoneNumber}
        editedOwnerImabariResidency={editedOwnerImabariResidency}
        setEditedOwnerImabariResidency={setEditedOwnerImabariResidency}
        handleSaveOwnerEdit={handleSaveOwnerEdit}
        handleCancelOwnerEdit={handleCancelOwnerEdit}
      />

      {/* Bottom Navigation - アシックス里山スタジアムスタイル */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t-2 border-asics-satoyama-blue/20 shadow-2xl z-50">
        <div className="flex justify-around py-3">
          <Button
            variant={activeTab === ActiveTab.Home ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(ActiveTab.Home)}
            className={`flex-col h-auto py-2 px-4 rounded-xl transition-all transform ${
              activeTab === ActiveTab.Home 
                ? "bg-asics-satoyama-blue text-white shadow-lg scale-105" 
                : "text-asics-satoyama-blue hover:bg-asics-satoyama-blue/10"
            }`}
          >
            <Home className={`h-5 w-5 mb-1 ${activeTab === ActiveTab.Home ? "animate-pulse" : ""}`} />
            <span className="text-xs font-bold">ホーム</span>
          </Button>
          <Button
            variant={activeTab === ActiveTab.Events ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(ActiveTab.Events)}
            className={`flex-col h-auto py-2 px-4 rounded-xl transition-all transform ${
              activeTab === ActiveTab.Events 
                ? "bg-asics-satoyama-blue text-white shadow-lg scale-105" 
                : "text-asics-satoyama-blue hover:bg-asics-satoyama-blue/10"
            }`}
          >
            <MapPin className={`h-5 w-5 mb-1 ${activeTab === ActiveTab.Events ? "animate-pulse" : ""}`} />
            <span className="text-xs font-bold">イベント</span>
          </Button>
          <Button
            variant={activeTab === ActiveTab.Feed && userStatus === UserStatus.LoggedIn ? "default" : "ghost"}
            size="sm"
            onClick={() => userStatus === UserStatus.LoggedIn && setActiveTab(ActiveTab.Feed)}
            className={`flex-col h-auto py-2 px-4 rounded-xl transition-all transform ${
              activeTab === ActiveTab.Feed && userStatus === UserStatus.LoggedIn
                ? "bg-asics-satoyama-blue text-white shadow-lg scale-105"
                : userStatus !== UserStatus.LoggedIn
                ? "text-gray-400 opacity-50 cursor-not-allowed"
                : "text-asics-satoyama-blue hover:bg-asics-satoyama-blue/10"
            }`}
            disabled={userStatus !== UserStatus.LoggedIn}
          >
            <MessageCircle className={`h-5 w-5 mb-1 ${activeTab === ActiveTab.Feed && userStatus === UserStatus.LoggedIn ? "animate-pulse" : ""}`} />
            <span className="text-xs font-bold">投稿</span>
          </Button>
          <Button
            variant={activeTab === ActiveTab.Entry && userStatus === UserStatus.LoggedIn ? "default" : "ghost"}
            size="sm"
            onClick={() => userStatus === UserStatus.LoggedIn && setActiveTab(ActiveTab.Entry)}
            className={`flex-col h-auto py-2 px-4 rounded-xl transition-all transform ${
              activeTab === ActiveTab.Entry && userStatus === UserStatus.LoggedIn
                ? "bg-asics-satoyama-blue text-white shadow-lg scale-105"
                : userStatus !== UserStatus.LoggedIn
                ? "text-gray-400 opacity-50 cursor-not-allowed"
                : "text-asics-satoyama-blue hover:bg-asics-satoyama-blue/10"
            }`}
            disabled={userStatus !== UserStatus.LoggedIn}
          >
            <QrCode className={`h-5 w-5 mb-1 ${activeTab === ActiveTab.Entry && userStatus === UserStatus.LoggedIn ? "animate-pulse" : ""}`} />
            <span className="text-xs font-bold">入場</span>
          </Button>
          <Button
            variant={activeTab === ActiveTab.Profile && userStatus === UserStatus.LoggedIn ? "default" : "ghost"}
            size="sm"
            onClick={() => userStatus === UserStatus.LoggedIn && setActiveTab(ActiveTab.Profile)}
            className={`flex-col h-auto py-2 px-4 rounded-xl transition-all transform ${
              activeTab === ActiveTab.Profile && userStatus === UserStatus.LoggedIn
                ? "bg-asics-satoyama-blue text-white shadow-lg scale-105"
                : userStatus !== UserStatus.LoggedIn
                ? "text-gray-400 opacity-50 cursor-not-allowed"
                : "text-asics-satoyama-blue hover:bg-asics-satoyama-blue/10"
            }`}
            disabled={userStatus !== UserStatus.LoggedIn}
          >
            <Users className={`h-5 w-5 mb-1 ${activeTab === ActiveTab.Profile && userStatus === UserStatus.LoggedIn ? "animate-pulse" : ""}`} />
            <span className="text-xs font-bold">マイページ</span>
          </Button>
        </div>
      </div>
      <ApplicationStatusModal
        isOpen={showApplicationStatusModal}
        onClose={() => setShowApplicationStatusModal(false)}
        applicationId={applicationId}
      />
    </div>
  )
}
