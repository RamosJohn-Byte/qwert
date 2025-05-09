import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// DOM elements
const getStartedBtn = document.getElementById("get-started-btn")

// Update get started button based on auth state
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (getStartedBtn) {
      if (user) {
        getStartedBtn.textContent = "Take a Quiz"
        getStartedBtn.href = "quizzes.html"
      } else {
        getStartedBtn.textContent = "Get Started"
        getStartedBtn.href = "register.html"
      }
    }
  } catch (error) {
    console.error("Error checking user:", error)
  }
})
