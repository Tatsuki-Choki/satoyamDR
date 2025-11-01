export const termsOfUseText = `
ご利用にあたっては、管理スタッフの指示に従ってください。従っていただけない場合はご利用をお断りする場合がございます。
予防接種(狂犬病・各種ワクチン)を1 年以内に受けていない犬及び犬鑑札をつけていない犬はご入場いただけません。
大型のワンちゃん(体重20kg 以上)のご利用はご遠慮頂いております。
入場後、ドッグランの雰囲気・ほかの犬になじませてからリードを外してください。
犬だけをドッグラン内に放置することの無いよう、常に必要な制御ができるように犬から目を離さず一緒に行動してください。
中学生以下の利用は保護者の同伴が必要です。また、３歳以下の乳幼児は安全のため入場させないでください。
ドッグランの中でおもちゃは使用しないでください。また、犬への餌やりや、飼い主の飲食及び喫煙もご遠慮願います。
ごみや犬の排泄物はご自身でお持ち帰りください（ごみ箱は用意してありません）。
次のいずれかに該当する場合は利用できません
発情期の雌犬及び病気の犬
闘犬を目的とした犬や無駄吠えをする犬等他の利用者に恐怖感を与える犬
犬以外のペット
万が一犬同士のトラブルが発生した場合は、即座にリード繋ぎ、飼い主と犬の安全に注意してトラブルの鎮圧化にご協力ください。
ドッグラン内におけるお客様同士のトラブルについて、弊社では一切の責任を負いかねます。当事者間で解決されるようお願いいたします。
個人が特定できうる情報や公序良俗に反するもの、発信内容が事実と著しく乖離する情報のインターネット上への書き込みや写真の掲載はおやめください。
天候などの事情によりドッグラン施設を閉鎖する場合がございます。
里山スタジアムでFC 今治トップチームが公開練習実施している際はボールが飛んでくる可能性がございます。予めご了承の上公開練習日にご利用の際はご留意ください。
緊急時や、上記事項をお守りいただけない場合、退出をお願いする場合があります。その際は 速やかに指示に従いご退出ください。
利用申込書に虚偽の記載があった場合ご利用をお断りする可能性がございます。
`

export const registeredEmail = "test@example.com"
export const registeredPassword = "password123"

export enum UserStatus {
  Initial = "initial",
  RegistrationForm = "registration_form",
  RegistrationPending = "registration_pending",
  ApprovedNeedsLogin = "approved_needs_login",
  LoggedIn = "logged_in",
  ForgotPasswordForm = "forgot_password_form",
  ForgotPasswordSent = "forgot_password_sent",
}

export enum ActiveTab {
  Home = "home",
  Events = "events",
  Feed = "feed",
  Entry = "entry",
  Profile = "profile",
}

export enum NewDogRegistrationStatus {
  Initial = "initial",
  Pending = "pending",
  Approved = "approved",
}

export enum CalendarType {
  Dogrun = "dogrun",
  Salon = "salon",
}

export enum DayStatus {
  Open = "open",
  Closed = "closed",
  Limited = "limited",
  Empty = "empty",
}

export enum ImabariResidency {
  LessThan1Year = "less_than_1_year",
  OneToThreeYears = "1_to_3_years",
  ThreeToFiveYears = "3_to_5_years",
  MoreThan5Years = "more_than_5_years",
  NotInImabari = "not_in_imabari",
}
