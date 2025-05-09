// Import necessary modules or declare variables
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "" // Replace with your actual URL or import
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "" // Replace with your actual key or import

// Initialize Supabase client
const supabase = supabase.createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

// DOM elements that exist across pages
const adminLink = document.getElementById("admin-link")
const loginLink = document.getElementById("login-link")
const registerLink = document.getElementById("register-link")
const logoutLink = document.getElementById("logout-link")
const logoutBtn = document.getElementById("logout-btn")

// Check if user is logged in
async function checkUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // User is logged in
      if (loginLink) loginLink.style.display = "none"
      if (registerLink) registerLink.style.display = "none"
      if (logoutLink) logoutLink.style.display = "block"

      // Check if user is admin
      const { data: userData, error } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

      if (!error && userData && userData.is_admin) {
        if (adminLink) adminLink.style.display = "block"
      }

      return user
    } else {
      // User is not logged in
      if (loginLink) loginLink.style.display = "block"
      if (registerLink) registerLink.style.display = "block"
      if (logoutLink) logoutLink.style.display = "none"
      if (adminLink) adminLink.style.display = "none"

      // Redirect from admin pages if not logged in
      if (window.location.href.includes("/admin/")) {
        window.location.href = "../login.html"
      }

      return null
    }
  } catch (error) {
    console.error("Error checking user:", error)
    return null
  }
}

// Handle logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Redirect to home page
      window.location.href = window.location.href.includes("/admin/") ? "../index.html" : "index.html"
    } catch (error) {
      console.error("Error logging out:", error)
      alert("Error logging out. Please try again.")
    }
  })
}

// Check user on page load
document.addEventListener("DOMContentLoaded", checkUser)
