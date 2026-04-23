import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session?.user) getProfile()
    else setLoading(false)
  }, [session])

  async function getProfile() {
    const { data } = await supabase
 .from('profiles')
 .select('*')
 .eq('id', session.user.id)
 .single()
    setProfile(data)
    setLoading(false)
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('خطأ في الدخول: ' + error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (loading) return <div className="flex h-screen items-center justify-center">جاري التحميل...</div>

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-96 bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">نظام الشيفتات</h1>
          <input
            type="email"
            placeholder="الإيميل"
            className="w-full border p-2 mb-4 rounded"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="الباسورد"
            className="w-full border p-2 mb-4 rounded"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={signIn}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            دخول
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">أهلاً {profile?.full_name || 'مستخدم'}</h1>
            <p className="text-gray-600">الدور: {profile?.role === 'admin'? 'أدمن' : 'موظف'}</p>
          </div>
          <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded">
            خروج
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">السيستم شغال 🎉</h2>
          <p>كده الدخول اشتغل. المرة الجاية نضيف صفحة الأدمن والشيفتات.</p>
        </div>
      </div>
    </div>
  )
}
