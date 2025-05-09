// Assuming supabase is initialized elsewhere, but declaring it here to avoid errors
// You might need to adjust the initialization based on your actual setup
const supabase = window.supabase

// DOM elements
const loginForm = document.getElementById("login-form")
const errorMessage = document.getElementById("error-message")

// Handle login form submission
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    try {
      // Show loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]')
      const originalBtnText = submitBtn.textContent
      submitBtn.textContent = "Logging in..."
      submitBtn.disabled = true

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (userError && userError.code !== "PGRST116") {
        // If error is not "no rows returned", it's a real error
        throw userError
      }

      // If user doesn't exist in our table, create them
      if (!userData) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email: data.user.email,
            is_admin: false,
          },
        ])

        if (insertError) {
          throw insertError
        }
      }

      // Redirect based on admin status
      if (userData && userData.is_admin) {
        window.location.href = "admin/index.html"
      } else {
        window.location.href = "index.html"
      }
    } catch (error) {
      console.error("Login error:", error)
      errorMessage.textContent = error.message || "Failed to log in. Please check your credentials."
      errorMessage.style.display = "block"

      // Reset button
      if (submitBtn) {
        submitBtn.textContent = originalBtnText
        submitBtn.disabled = false
      }
    }
  })
}
