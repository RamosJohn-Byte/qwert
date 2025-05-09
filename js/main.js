// Import supabase client
import { supabase } from "./supabaseClient.js"

// DOM elements
const getStartedBtn = document.getElementById("get-started-btn")

// Simple script to check if JavaScript is loading
console.log("Main.js loaded successfully")

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
